import { useEffect, useState } from "react";
import { Layout, ListBoxContainer, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";
import ReportContent from "../../components/report/ReportContent";
import axios from "axios";

const ReportList = () => {

    const [reportList, setReportList] = useState([]);
    const [dates, setDates] = useState([]);

    // 디버깅: title prop 확인
    const pageTitle = "내 신고목록";
    console.log("ReportList 렌더링, title:", pageTitle);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/public/report/list`)
            .then(res => {
                setReportList(res.data);
                const dateSet = [...new Set(res.data.map(report => report.regDate.toString().slice(0, 10)))];
                setDates(dateSet);
            })
    }, [])

    return (
        <Layout title={pageTitle}>
            <Grid container width={"100%"}>
                <Grid size={3} />
                <Grid size={6}>
                    {dates.map((date) => (
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
                    ))}


                </Grid>
                <Grid size={3} />
            </Grid>

        </Layout>
    )
}
export default ReportList;