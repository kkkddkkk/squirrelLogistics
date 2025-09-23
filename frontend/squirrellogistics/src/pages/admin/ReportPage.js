import { Box, Grid, useTheme } from "@mui/material";
import { CommonSmallerTitle, CommonTitle } from "../../components/common/CommonText";
import CommonList from "../../components/common/CommonList";
import './chart.css';
import { OneButtonAtRight } from "../../components/common/CommonButton";
import { ReportBarChart, ReportLineChart, ReportPieChart } from "../../components/admin/Report/ReportChart";
import { theme } from "../../components/common/CommonTheme";
import ScrollTopButton from "../Layout/ScrollTopButton";
import { useEffect, useState } from "react";
import { getReportDashBoard } from "../../api/admin/reportApi";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { switchCate, switchStatus } from "../../components/admin/Report/reportEnum";
import { useNavigate } from "react-router-dom";
const ReportPage = () => {

    const thisTheme = useTheme();
    const { moveToMain } = useHistoryMove();
    const navigate = useNavigate();
    const [data, setData] = useState();
    const [monthlyData, setMonthlyData] = useState([
        { month: '1월', "신고건수": 0 },
        { month: '2월', "신고건수": 0 },
        { month: '3월', "신고건수": 0 },
        { month: '4월', "신고건수": 0 },
        { month: '5월', "신고건수": 0 },
        { month: '6월', "신고건수": 0 },
        { month: '7월', "신고건수": 0 },
        { month: '8월', "신고건수": 0 },
        { month: '9월', "신고건수": 0 },
        { month: '10월', "신고건수": 0 },
        { month: '11월', "신고건수": 0 },
        { month: '12월', "신고건수": 0 }
    ]);

    const percentage = (allData, data, attribute) => {
        let sumData = allData.reduce((old, curr) => old + curr[attribute], 0);
        let percentData = (data / sumData) * 100;

        return `${parseFloat(percentData.toFixed(2))}%`
    }

    const statusColor = {
        PENDING: theme.palette.error.main,
        IN_REVIEW: theme.palette.warning.main,
        ACTION_TAKEN: theme.palette.success.main,

    };

    const pieChartColors = [
        theme.palette.error.main,
        theme.palette.error.light,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.secondary.main,
        theme.palette.primary.main,
        theme.palette.warning.dark
    ];

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();

        getReportDashBoard({ accessToken })
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        if (data == null || data.length == 0) return;
        setMonthlyData((prev) =>
            prev.map((item, idx) => {
                const found = data.monthlyCount.find(
                    (backData) => backData.month === idx + 1
                );
                return found
                    ? { ...item, "신고건수": found.monthlyCount } // 값 갱신
                    : item; // 그대로 유지
            })
        );
    }, [data])

    const ReportDashList = ({ title, leftSize, rightSize, leftChildren, rightChildren, showDetailFunc }) => {
        return (
            <>
                <CommonSmallerTitle>* {title}</CommonSmallerTitle>
                <CommonList padding={2}>
                    <Grid container spacing={0} marginTop={2}>
                        <Grid size={leftSize}>
                            <Box sx={{
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexWrap: "wrap"
                            }}>
                                {leftChildren}
                            </Box>
                        </Grid>
                        <Grid size={rightSize}>
                            {rightChildren}
                        </Grid>
                        <Grid size={12}><OneButtonAtRight clickEvent={showDetailFunc}>상세보기</OneButtonAtRight></Grid>
                    </Grid>
                </CommonList>
                <Box sx={{ marginTop: 10 }}></Box>
            </>
        )
    }

    return (
        <>
            <CommonTitle>신고확인</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={2} />
                <Grid size={8}>
                    <ReportDashList
                        title={"문의 처리 상태"}
                        leftSize={5}
                        rightSize={7}
                        leftChildren={<ReportPieChart
                            data={data?.statusCount}
                            colorState={(entry) => statusColor[entry.rstatus] || "#ccc"}
                            label={true}
                            dataKey={"statusCount"} />}
                        rightChildren={
                            data?.statusCount.map((status, idx) => (
                                <CommonList padding={'3px'} sx={{ width: "100%" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1px 8px" }}>
                                        <Box>{switchStatus(status.rstatus)}</Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box color={thisTheme.palette.text.secondary} marginRight={1}>
                                                총 {status.statusCount}건
                                                ({percentage(data?.statusCount, status.statusCount, 'statusCount')})</Box>
                                            <Box sx={{ width: "20px", aspectRatio: 1 / 1, backgroundColor: statusColor[status.rstatus] || "#ccc"}} />
                                        </Box>
                                    </Box>
                                </CommonList>
                            ))
                        }
                        showDetailFunc={() => navigate(`/admin/report/list/status`)}
                    />
                    <ReportDashList
                        title={"가장 많이 신고된 사용자 목록"}
                        leftSize={5}
                        rightSize={7}
                        leftChildren={
                            data?.mostReported.map((reported, idx) => (
                                <CommonList padding={'3px'} sx={{ width: "100%" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
                                        <Box>{reported.reportedName} [{reported.role} #{reported.reportedId}]</Box>
                                        <Box color={thisTheme.palette.text.secondary}>
                                            {reported.reportCount}건</Box>
                                    </Box>
                                </CommonList>
                            ))
                        }
                        rightChildren={
                            <ReportBarChart
                                data={data?.mostReported}
                                nameKey={"reportedName"}
                                valueKey={"reportCount"} />
                        }
                    />
                    <ReportDashList
                        title={"신고 유형 비율"}
                        leftSize={5}
                        rightSize={7}
                        leftChildren={<ReportPieChart data={data?.cateCount} colorState={pieChartColors} dataKey={"cateCount"} />}
                        rightChildren={
                            data?.cateCount.map((cate, idx) => (
                                <CommonList padding={'3px'} sx={{ width: "100%" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1px 8px" }}>
                                        <Box>{switchCate(cate.cate)}</Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Box color={thisTheme.palette.text.secondary} marginRight={1}>
                                                총 {cate.cateCount}건
                                                ({percentage(data?.cateCount, cate.cateCount, 'cateCount')})
                                            </Box>
                                            <Box sx={{ width: "20px", aspectRatio: 1 / 1, backgroundColor: pieChartColors[idx] }} />
                                        </Box>
                                    </Box>
                                </CommonList>
                            ))
                        }
                        showDetailFunc={() => navigate(`/admin/report/list/cate`)}
                    />
                    <CommonSmallerTitle>* {new Date().getFullYear()}년도 월별 신고 건수</CommonSmallerTitle>
                    <CommonList padding={2}>
                        <Grid container spacing={0} marginTop={2}>
                            <Grid size={12}>
                                <ReportLineChart data={data ? monthlyData : []} valueKey={"신고건수"} />
                            </Grid>
                            <Grid size={12}><OneButtonAtRight>상세보기</OneButtonAtRight></Grid>
                        </Grid>
                    </CommonList>
                    <Box sx={{ marginTop: 10 }}></Box>

                    <ScrollTopButton />

                </Grid>
                <Grid size={2} />
            </Grid>
        </>
    )
}
export default ReportPage;