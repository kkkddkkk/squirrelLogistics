import { Box, Grid, TextField, Typography, useTheme } from "@mui/material";
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import CommonList from "../../components/common/CommonList";
import './chart.css';
import { OneButtonAtRight, TwoButtonsAtRight } from "../../components/common/CommonButton";
import ScrollTopButton from "../Layout/ScrollTopButton";
import { useEffect, useState } from "react";
import { createAnswer, getDetailReport, getReportDashBoard, updateAnswer } from "../../api/admin/reportApi";
import { useLocation, useNavigate } from "react-router-dom";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
const ReportPage = () => {

    const thisTheme = useTheme();
    const { moveToMain } = usePaymentMove();
    const navigate = useNavigate();
    const [data, setData] = useState();
    const [preview, setPreview] = useState([]);
    const [reporter, setReporter] = useState('');
    const [reported, setReported] = useState('');
    const [writing, setWriting] = useState(false);
    const [form, setForm] = useState({ content: '' });

    const location = useLocation();  // 현재 경로 정보
    const pathArray = location.pathname.split("/").filter(Boolean);
    const reportId = pathArray[pathArray.length - 1];

    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        if (!accessToken) return moveToMain();

        getDetailReport({ accessToken, reportId })
            .then(res => {
                console.log(res.data);
                setData(res.data);
                setPreview(res.data.imgUrls);
                setForm({
                    content: data?.answerId === 0 ? '' : data?.answerContent || ''
                });
                if (res.data.reporter === 'COMPANY') {
                    setReporter('물류회사');
                    setReported('운전자');
                } else {
                    setReporter('운전자');
                    setReported('물류회사');
                }
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [writing])

    const handleWriteAnswer = () => {
        if (data?.answerId === 0) {
            createAnswer({ accessToken, reportId, form })
                .then().finally(
                    setWriting(false)
                );
        } else {
            updateAnswer({ accessToken, reportId, form })
                .then().finally(
                    setWriting(false)
                );
        }

    }

    const handleDeleteAnswer = () => {
        setForm({
            content: data?.answerId === 0 ? '' : data?.answerContent || ''
        });
        setWriting(false);
    }

    return (
        <>
            <CommonTitle>상세 문의내용</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={2} />
                <Grid size={8}>
                    <CommonSubTitle>{data?.regDate} 등록</CommonSubTitle>
                    <Grid container spacing={3}>
                        <Grid size={6}>
                            <CommonList padding={5}>
                                <CommonSubTitle>* 신고자 정보</CommonSubTitle>
                                <CommonSmallerTitle>
                                    회원명: {data?.reporterName} ({reporter} #{data?.reporterId})
                                </CommonSmallerTitle>
                                <CommonSmallerTitle>
                                    전화번호: {data?.reporterNum}
                                </CommonSmallerTitle>
                            </CommonList>
                        </Grid>
                        <Grid size={6}>
                            <CommonList padding={5}>
                                <CommonSubTitle>* 신고대상 정보</CommonSubTitle>
                                <CommonSmallerTitle>
                                    회원명: {data?.reportedName} ({reported} #{data?.reportedId})
                                </CommonSmallerTitle>
                                <CommonSmallerTitle>
                                    전화번호: {data?.reportedNum}
                                </CommonSmallerTitle>
                            </CommonList>
                        </Grid>
                    </Grid>

                    <CommonList padding={5}>
                        <CommonSmallerTitle>{data?.title}</CommonSmallerTitle>
                        <Typography textAlign={"justify"}>{data?.content}</Typography>
                        {preview?.length > 0 ?
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

                        <Box width={"100%"} border={`1px solid ${thisTheme.palette.text.secondary}`} margin={"5% 0"} />
                        <CommonSubTitle>A. {data?.title}의 답변</CommonSubTitle>
                        {writing ?
                            <TextField
                                fullWidth
                                multiline
                                sx={{ margin: "20px 0" }}
                                value={data?form.content:''}
                                placeholder={data?.answerId === 0 ? data?.answerContent : ''}
                                rows={10}
                                name="content"
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        [e.target.name]: e.target.value,
                                    }))
                                }

                            /> :
                            <Typography textAlign={"justify"} marginTop={5} marginBottom={5}>
                                {data?.answerContent}
                            </Typography>
                        }

                        {writing ?
                            <TwoButtonsAtRight
                                leftTitle={'답변 삭제'}
                                leftDisabled={data?.answerId === 0}
                                leftColor={thisTheme.palette.error.main}
                                leftClickEvent={handleDeleteAnswer}
                                rightTitle={'답변 저장'}
                                rightClickEvent={handleWriteAnswer}
                                gap={2}
                            />
                            :
                            <OneButtonAtRight clickEvent={() => setWriting(true)}>
                                답변 {data?.answerId === 0 ? '작성' : '수정'}
                            </OneButtonAtRight>
                        }


                    </CommonList>
                </Grid>
                <Grid size={2} />
            </Grid>
        </>
    )
}
export default ReportPage;