import { Box, FormControl, Grid, TextField, Typography, useTheme } from "@mui/material";
import { SubTitle } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import ReportRadio from "../../components/report/ReportRadio";
import ReportImgList from "../../components/report/ReportImgList";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import { ButtonContainer, One100ButtonAtCenter } from "../../components/common/CommonButton";
import CommonList from "../../components/common/CommonList";
import LoadingComponent from "../../components/common/LoadingComponent";
import API_SERVER_HOST from "../../api/apiServerHost";


const Report = () => {
    const [params] = useSearchParams();
    const assignedId = params.get("id");
    const reportId = params.get("rId");
    const accesstoken = localStorage.getItem('accessToken');
    const { moveToActualCalc } = usePaymentMove();

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

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reportId !== "0" && reportId !== null) {
            setLoading(true);
            axios.get(`${API_SERVER_HOST}/report`, {
                params: { reportId: reportId },
                headers: {
                    Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
                },
            }).then(res => {
                setViewReport(res.data);
                setPreview(res.data.fileName);
            }).catch(err => {
                // console.error("불러오기 실패", err);
            }).finally(() => setLoading(false))
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

        if (report.rTitle.length === 0) {
            alert("제목을 입력해주세요.")
            return;
        }

        if (report.rContent.length < 5) {
            alert("내용을 5자 이상 입력해주세요.")
            return;
        }

        if (!report.rCate) {
            alert("카테고리가 지정되지 않았습니다.")
            return;
        }

        preview.forEach(file => {
            if (file.size > 1 * 1024 * 1024) {
                alert("파일 크기가 너무 큽니다 (최대 1MB)");
                return;
            }
            formData.append("files", file);
        });

        formData.forEach((value, key) => {
            if (key === "report") {
                const reader = new FileReader();
                // reader.onload = () => {
                //     console.log("report JSON:", reader.result); // 여기서 실제 JSON 문자열 확인 가능
                // };
                reader.readAsText(value);
            }
        });

        await axios.post(`${API_SERVER_HOST}/report`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
            },
        }).then(res => {
            // console.log("등록 성공", res.data);
            if (window.opener) {
                window.close();
            } else {
                moveToActualCalc({ assignedId, reported: true });
            }


            axios.get(`${API_SERVER_HOST}/companyHistory/getTodayContent`, {
                params: { assignedId: assignedId },
                headers: {
                    Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
                },
            }).then(res => {
                // console.log(res.data);
            })
        }).catch(err => {
            // console.error("등록 실패", err);
        })

    }

    return (
        <>
            <LoadingComponent open={loading} text="신고내역을 불러오는 중..." />
            <CommonTitle>1:1 문의사항</CommonTitle>
            <Grid container maxWidth="1000px" margin="0 auto" display={"flex"} flexWrap={"wrap"} marginBottom={"5%"}>
                <Grid item size={3} />
                <Grid item size={6} display={"flex"} flexWrap={"wrap"} flexDirection={"column"}>
                    {reportId === "0" || reportId === null ?
                        <form onSubmit={handleSubmit}>
                            <FormControl fullWidth >
                                <CommonSubTitle>제목</CommonSubTitle>
                                <TextField fullWidth sx={{ marginBottom: "5%" }} name="rTitle" onChange={writing}></TextField>

                                <CommonSubTitle>내용</CommonSubTitle>
                                <TextField fullWidth multiline rows={10} sx={{ marginBottom: "5%" }} name="rContent" onChange={writing}></TextField>

                                <Box marginBottom={"5%"} width={"100%"}>
                                    <ReportRadio cateValue={report.rCate} setCateValue={(cate) => setReport(prev => ({ ...prev, rCate: cate }))} reporter={report.reporter}></ReportRadio>
                                </Box>

                                <CommonSubTitle>사진({preview.length}/5)</CommonSubTitle>
                                <ReportImgList preview={preview} setPreview={setPreview} />

                                {/* <OneBigBtn margin={"10%"}>신&nbsp;&nbsp;&nbsp;고</OneBigBtn> */}
                                <ButtonContainer marginBottom={5}>
                                    <One100ButtonAtCenter>신&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;고</One100ButtonAtCenter>
                                </ButtonContainer>
                            </FormControl>
                        </form> :
                        <>
                            <SubTitle>{viewReport.regDate.toString().slice(0, 10)} 등록</SubTitle>
                            <CommonList padding={5}>
                                <CommonSmallerTitle>{viewReport.rtitle}</CommonSmallerTitle>
                                <Typography textAlign={"justify"}>{viewReport.rcontent}</Typography>
                                {preview.length > 0 ?
                                    <Box width={"100%"} height={"200px"} display={"flex"} overflow={"auto"} margin={"5% 0"}>                                {
                                        preview && preview.map((fileName, idx) => (
                                            <img
                                                key={idx}
                                                src={`${API_SERVER_HOST}/public/reportImage/${fileName}`}
                                                alt={`${fileName}`}
                                                style={{ margin: "5px" }}
                                            />
                                        ))
                                    }</Box> : <></>
                                }

                                <Box width={"100%"} border={"1px solid #909095"} margin={"5% 0"} />
                                <CommonSubTitle>A. {viewReport.rtitle}의 답변</CommonSubTitle>
                                <Typography textAlign={"justify"}>
                                    아직 답변이 등록되지 않았습니다.
                                </Typography>
                            </CommonList>
                        </>
                    }

                </Grid>
                <Grid item size={3} />
            </Grid>
        </>
    )
}
export default Report;