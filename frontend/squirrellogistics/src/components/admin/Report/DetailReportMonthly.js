import { Box, Grid, Typography, useTheme } from "@mui/material";
import CommonList from "../../common/CommonList";

import ReportList from "./ReportList";
import { useEffect, useState } from "react";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getMonthly, getRank } from "../../../api/admin/reportApi";
import usePaymentMove from "../../../hook/paymentHook/usePaymentMove";
import { ReportLineChart } from "./ReportChart";
import { CommonSubTitle } from "../../common/CommonText";
import { now } from "moment";

const ReportPage = () => {
    const thisTheme = useTheme();
    const { moveToMain } = usePaymentMove();
    const [keyword2, setKeyword2] = useState();
    const [data, setData] = useState([]);
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
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        getMonthly({ accessToken, year })
            .then(res => {
                console.log(res.data);
                // setData(res.data);
                const apiData = res.data || [];
                const updatedMonthlyData = Array.from({ length: 12 }, (_, i) => {
                    const found = apiData.find(d => Number(d.month) === i + 1);
                    return { month: `${i + 1}월`, "신고건수": found ? found.monthlyCount : 0 };
                });
                setMonthlyData(updatedMonthlyData);
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [year])

    // useEffect(() => {
    //     if (!data || data.length === 0) {
    //         setMonthlyData(prev => prev.map(item => ({ ...item, "신고건수": 0 })));
    //         return;
    //     }
    //     setMonthlyData((prev) =>
    //         prev.map((item, idx) => {
    //             const found = data.find(
    //                 (backData) => backData.month === idx + 1
    //             );
    //             return found
    //                 ? { ...item, "신고건수": found.monthlyCount } // 값 갱신
    //                 : item; // 그대로 유지
    //         })
    //     );
    // }, [data])

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <CommonList padding={3}>
                        <Box sx={{ width: "100%", margin: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <KeyboardArrowLeftIcon sx={{ fontSize: "40px", fontWeight: "bold" }} onClick={() => setYear(year - 1)} />
                            <Typography sx={{ fontSize: "28px", fontWeight: "bold", cursor: "pointer" }} display={"inline-block"}>
                                {year}년도
                            </Typography>
                            <KeyboardArrowRightIcon sx={{ fontSize: "40px", fontWeight: "bold", cursor: "pointer" }} onClick={() => setYear(year + 1)} />
                        </Box>
                        <ReportLineChart data={monthlyData || []} valueKey={"신고건수"} />
                    </CommonList>
                </Grid>

            </Grid>
            <ReportList></ReportList>
        </>
    );
}
export default ReportPage;