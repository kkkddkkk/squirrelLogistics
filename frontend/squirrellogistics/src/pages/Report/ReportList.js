import { useEffect, useState } from "react";
import { Layout, ListBoxContainer, NoneOfList, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";
import ReportContent from "../../components/report/ReportContent";
import axios from "axios";
import { getReportList } from "../../api/company/reportApi";
import Logo from '../../components/common/squirrelLogisticsLogo.png';

const ReportList = () => {

    const [reportList, setReportList] = useState([]);
    const [dates, setDates] = useState([]);
    const [dataLengths, setDataLengths] = useState(0);

    useEffect(() => {
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
            });
    }, []);


    return (
        <Layout title={"내 신고목록"}>
            <Grid container width={"100%"}>
                <Grid size={3} />
                <Grid size={6}>
                    {dataLengths == 0 ?
                        <NoneOfList logoSrc={Logo}>아직 작성한 신고가 없습니다.</NoneOfList>:
                        (dates.map((date) => (
                            <Box marginBottom={"5%"}>
                                <SubTitle>{date}</SubTitle>
                                {reportList.map((report) => (
                                    <ReportContent
                                        header={`${report.startAddress.toString().slice(0, 15)}... > ${report.endAddress.toString().slice(0, 15)}...`}
                                        title={report.rTitle}
                                        content={report.rContent}
                                        answer={"answer"}
                                        preview={report.fileNames}
                                    ></ReportContent>
                                ))
                                }
                            </Box>
                        )))
                    }



                </Grid>
                <Grid size={3} />
            </Grid>

        </Layout>
    )
}
export default ReportList;