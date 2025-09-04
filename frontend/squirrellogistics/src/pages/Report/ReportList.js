import { useEffect, useState } from "react";
import { Layout, ListBoxContainer, NoneOfList, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import ReportContent from "../../components/report/ReportContent";
import axios from "axios";
import { getReportList } from "../../api/company/reportApi";
import Logo from '../../components/common/squirrelLogisticsLogo.png';
import darkLogo from '../../components/common/squirrelLogisticsLogo_dark.png';
import { CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import LoadingComponent from "../../components/common/LoadingComponent";
import { ButtonContainer, One100ButtonAtCenter } from "../../components/common/CommonButton";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

const ReportList = () => {

    const [reportList, setReportList] = useState([]);
    const [dates, setDates] = useState([]);
    const [dataLengths, setDataLengths] = useState(0);
    const [loading, setLoading] = useState(false);
    const { moveBack } = useHistoryMove();

    const thisTheme = useTheme();

    useEffect(() => {
        setLoading(true);
        getReportList()
            .then(data => {
                setReportList(data || []);
                // 날짜 추출도 여기서
                const dateSet = [...new Set((data || []).map(report => report.regDate.toString().slice(0, 10)))];
                setDates(dateSet);
                setDataLengths(data.length);
            })
            .catch(err => {
                console.error("데이터 가져오기 실패", err);
            }).finally(() => setLoading(false));
    }, []);


    return (
        <>
            <Header />
            <Box>
                <CommonTitle>내 문의내역</CommonTitle>
                <LoadingComponent open={loading} text="내 신고내역 불러오는 중..." />
                <Grid container width={"100%"} marginBottom={5} minHeight={"100vh"}>
                    <Grid size={3} />
                    <Grid size={6}>
                        {dataLengths == 0 ?
                            <NoneOfList logoSrc={thisTheme.palette.mode === "light" ? Logo : darkLogo}>아직 작성한 신고가 없습니다.</NoneOfList> :
                            (dates.map((date) => (
                                <Box marginBottom={"5%"}>
                                    <CommonSubTitle>{date}</CommonSubTitle>
                                    {reportList.map((report) => (
                                        report.regDate.toString().slice(0, 10) === date ?
                                            <ReportContent
                                                header={`${report.startAddress.toString().slice(0, 15)}... > ${report.endAddress.toString().slice(0, 15)}...`}
                                                title={report.rTitle}
                                                content={report.rContent}
                                                answer={"answer"}
                                                preview={report.fileNames}
                                            ></ReportContent> : <></>
                                    ))
                                    }
                                </Box>
                            )))
                        }
                        <ButtonContainer marginTop={10} marginBottom={5}>
                            <One100ButtonAtCenter height={50} clickEvent={() => moveBack()}>뒤로가기</One100ButtonAtCenter>
                        </ButtonContainer>

                    </Grid>
                    <Grid size={3} />
                </Grid>
            </Box>
            <Footer />
        </>


    )
}
export default ReportList;