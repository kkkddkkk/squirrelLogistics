import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { Layout, OneBigBtn, SubTitle } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import ReportRadio from "../../components/report/ReportRadio";
import ReportImgList from "../../components/report/ReportImgList";
import axios from "axios";
import { useSearchParams } from "react-router-dom";


const Report = () => {
    const [params] = useSearchParams();
    const assignedId = params.get("id");
    const reportId = params.get("rId");

    const [preview, setPreview] = useState([]);
    const [report, setReport] = useState({
        assignedId: assignedId,
        rTitle: '',
        rContent: '',
        reporter: 'COMPANY',
        rStatus: 'PENDING',
        rCate: ''
    });

    const [viewReport, setViewReport] = useState({
        fileName: '',
        rtitle: '',
        rcontent: '',
        regDate: '',
        reporter: '',
        fileName: []
    })

    useEffect(() => {
        if (reportId != 0) {
            axios.get(`http://localhost:8080/api/public/report`, {
                params: { reportId: reportId },
            }).then(res => {
                setViewReport(res.data);
                setPreview(res.data.fileName);
            }).catch(err => {
                console.error("등록 실패", err);
            })
        }
    }, [])

    const writing = (e) => {
        setReport(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // 페이지 리로드 방지

        const formData = new FormData();
        const reportBlob = new Blob([JSON.stringify(report)], { type: "application/json" });
        formData.append("report", reportBlob);

        preview.forEach(file => {
            formData.append("files", file);
        });

        formData.forEach((value, key) => {
            if (key === "report") {
                const reader = new FileReader();
                reader.onload = () => {
                    console.log("report JSON:", reader.result); // 여기서 실제 JSON 문자열 확인 가능
                };
                reader.readAsText(value);
            } else {
                console.log(key, value);
            }
        });

        await axios.post(`http://localhost:8080/api/public/report`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then(res => {
            console.log("등록 성공", res.data);
            window.close();

            axios.get(`http://localhost:8080/api/public/companyHistory/getTodayContent`, {
                params: { assignedId: assignedId }
            }).then(res => {
                console.log(res.data);
            })
        }).catch(err => {
            console.error("등록 실패", err);
        })

    }

    return (
        <Layout title={"1:1 문의사항"} >
            <Grid container width={"80%"} maxWidth="1000px" margin="0 auto" display={"flex"} flexWrap={"wrap"} marginBottom={"5%"}>
                <Grid item size={3} />
                <Grid item size={6} display={"flex"} flexWrap={"wrap"} flexDirection={"column"}>
                    {reportId != 0 ?
                        <>
                            <SubTitle>{viewReport.regDate.toString().slice(0, 10)}</SubTitle>
                            <Box margin={"3%"} width={"100%"}>
                                <SubTitle>{viewReport.rtitle} </SubTitle>
                                <Typography textAlign={"justify"}>{viewReport.rcontent}</Typography>
                                {preview.length>0 ?
                                    <Box width={"100%"} height={"200px"} display={"flex"} overflow={"auto"} margin={"5% 0"}>                                {
                                        preview && preview.map((fileName, idx) => (
                                            <img
                                                key={idx}
                                                src={`http://localhost:8080/api/public/reportImage/${fileName}`}
                                                alt={`${fileName}`}
                                                style={{ margin: "5px" }}
                                            />
                                        ))
                                    }</Box> : <></>
                                }

                                <Box width={"100%"} border={"1px solid #909095"} margin={"5% 0"} />
                                <SubTitle>A. {viewReport.rtitle}의 답변</SubTitle>
                                <Typography textAlign={"justify"}>
                                    00
                                </Typography>
                            </Box>
                        </>
                        :
                        <form onSubmit={handleSubmit}>
                            <FormControl fullWidth >

                                <SubTitle>제목</SubTitle>
                                <TextField fullWidth sx={{ marginBottom: "5%" }} name="rTitle" onChange={writing}></TextField>

                                <SubTitle>내용</SubTitle>
                                <TextField fullWidth multiline rows={10} sx={{ marginBottom: "5%" }} name="rContent" onChange={writing}></TextField>

                                <Box marginBottom={"5%"} width={"100%"}>
                                    <ReportRadio cateValue={report.rCate} setCateValue={(cate) => setReport(prev => ({ ...prev, rCate: cate }))} reporter={report.reporter}></ReportRadio>
                                </Box>

                                <SubTitle>사진({preview.length}/5)</SubTitle>
                                <ReportImgList preview={preview} setPreview={setPreview} />

                                <OneBigBtn margin={"10%"}>신&nbsp;&nbsp;&nbsp;고</OneBigBtn>
                            </FormControl>
                        </form>
                    }

                </Grid>
                <Grid item size={3} />
            </Grid>
        </Layout>
    )
}
export default Report;