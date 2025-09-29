import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import CommonList from "../../common/CommonList";

import ReportList from "./ReportList";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { getRank } from "../../../api/admin/reportApi";
import usePaymentMove from "../../../hook/paymentHook/usePaymentMove";

const ReportPage = () => {
    const thisTheme = useTheme();
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));
    const { moveToMain } = usePaymentMove();
    const [keyword2, setKeyword2] = useState();
    const [data, setData] = useState([]);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        getRank({ accessToken })
            .then(res => {
                console.log(res.data);
                setData(res.data);
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [])

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <CommonList padding={3}>
                        <ResponsiveContainer width="100%" height={isMobile?300:400}>
                            <BarChart data={data} margin={isMobile ? {bottom: 40} : { top: 20, right: 30, left: 20, bottom: 50 }}>
                                <XAxis
                                    dataKey="reportedName"
                                    type="category"
                                    tick={{ fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }}
                                    tickFormatter={(v) => v.length > 6 ? v.slice(0, 6) + '…' : v}
                                    angle={45}         // 👈 글자를 기울여서 표시
                                    textAnchor="start"    // 끝점 기준으로 정렬
                                    interval={0}        // 모든 tick 표시
                                />
                                <YAxis
                                    type="number"
                                    tick={isMobile ? false : { fill: thisTheme.palette.text.primary, fontSize: 14, fontWeight: 500 }}
                                    domain={[0, 'dataMax + 2']}
                                    axisLine={isMobile ? false : true}
                                    width={isMobile ? 0 : ""}
                                />
                                <Bar dataKey="reportCount" fill={thisTheme.palette.primary.main}>
                                    <LabelList dataKey="reportCount" position="top" style={{ fill: thisTheme.palette.text.primary }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CommonList>
                </Grid>

            </Grid>
            <ReportList status={keyword2}></ReportList>
        </>
    );
}
export default ReportPage;