// SettlementDashboardComponent.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
import {
    Box, Stack, Paper, Typography, Tooltip, CircularProgress,
    Badge, useTheme,
} from "@mui/material";
import {
    CheckCircle,
} from "@mui/icons-material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend,
    ResponsiveContainer, Line, LineChart,
} from "recharts";
import { CardStat, Section, QuickRangeChips, QuickTrendChips } from "./SettlementCommonUI";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { currency, fillTrendGaps } from "./settlementUtilities";
import { settlementApi } from "../../api/settlement/settlementAPI";

const chartHeight = 320;

const ChartWrapper = styled("div")({
    height: chartHeight,
    "& .recharts-tooltip-cursor": { fill: "#696969ff", opacity: 0.1 },
});

export default function SettlementDashboardComponent({ onGoUnsettled }) {
    const theme = useTheme();
    const navigate = useNavigate();

    /* ─────────────────────────── 0) 상단 KPI: 항상 이번달 + 전역 미정산 ─────────────────────────── */
    const month = useMemo(() => ({
        from: dayjs().startOf("month"), to: dayjs().endOf("month"),
    }), []);
    const [loadingCards, setLoadingCards] = useState(true);
    const [summary, setSummary] = useState(null);
    const [unsettledAll, setUnsettledAll] = useState({ count: 0, amount: 0 });

    const fetchCards = useCallback(async () => {
        setLoadingCards(true);
        try {

            const ym = dayjs().format("YYYY-MM");
            const [s, u] = await Promise.all([
                settlementApi.getMonthlySummary({ month: ym }),
                settlementApi.getUnsettledSummary(),
            ]);
            setSummary(s);
            setUnsettledAll(u);
        } finally {
            setLoadingCards(false);
        }
    }, []);

    useEffect(() => { fetchCards(); }, [fetchCards]);


    /* ─────────────────────────── 1) 섹션1(막대): 기본 이번달, QuickRangeChips로 제어 ─────────────────────────── */
    const [range, setRange] = useState({
        key: "month", from: dayjs().startOf("month"), to: dayjs().endOf("month"),
    });
    const [loadingBar, setLoadingBar] = useState(true);
    const [byMethod, setByMethod] = useState([]);


    const fetchBar = useCallback(async () => {
        setLoadingBar(true);
        try {

            const rows = await settlementApi.getByMethod({ from: range.from, to: range.to });
            setByMethod(
                rows.map(r => ({
                    method: r.method || "unknown",
                    gross: r.gross || 0,
                    fee: r.fee || 0,
                    net: (r.net != null ? r.net : (r.gross || 0) - (r.fee || 0)),
                }))
            );
        } finally {
            setLoadingBar(false);
        }
    }, [range.from, range.to]);
    useEffect(() => { fetchBar(); }, [fetchBar]);

    /* ─────────────────────────── 2) 섹션2(라인): 기본 지난 6개월, 전용 데이터 페치 ─────────────────────────── */
    const [trendPreset, setTrendPreset] = useState("6m"); // '7d' | '8w' | '6m'
    const trend = useMemo(() => getTrendWindow(trendPreset), [trendPreset]);

    const [loadingLine, setLoadingLine] = useState(true);
    const [trendRaw, setTrendRaw] = useState([]);
    const trendData = useMemo(() => fillTrendGaps(trendRaw, trend), [trendRaw, trend]);

    const fetchLine = useCallback(async () => {
        setLoadingLine(true);
        try {
            const rows = await settlementApi.getTrend({
                from: trend.from, to: trend.to, interval: trend.interval,
            });
            setTrendRaw(rows || []);
        } finally {
            setLoadingLine(false);
        }
    }, [trend.from, trend.to, trend.interval]);

    useEffect(() => { fetchLine(); }, [fetchLine]);


    /* ─────────────────────────── palette ─────────────────────────── */
    const BAR = {
        gross: theme.palette.mode === "dark" ? "#8bcbed" : "#245785ff",
        net: theme.palette.mode === "dark" ? "#58A0C8" : "#113f67",
        fee: theme.palette.mode === "dark" ? "#2a749c" : "#031e36ff",
    };
    const LINE = {
        gross: BAR.gross, fee: BAR.fee, net: BAR.net, // 동일 톤
    };

    return (
        <Stack spacing={3}>
            {/* ───────── KPI Cards (이번달 고정 + 전역 미정산) ───────── */}
            <Box sx={{
                display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, width: "100%",
            }}>
                <CardStat
                    variant="kpi" tone="primary"
                    icon="gross"
                    label="이번달 총 매출"
                    value={loadingCards || !summary ? "…" : `${currency(summary.gross)} 원`}
                    sub={loadingCards || !summary ? "" : `이번달 완료 결제건: ${summary.completedCount}건`}
                />
                <CardStat
                    variant="kpi" tone="indigo"
                    icon="fee"
                    label="이번달 총 수수료"
                    value={loadingCards || !summary ? "…" : `${currency(summary.fee)} 원`}
                    sub={loadingCards || !summary ? "" : `이번달 순정산: ${currency(summary.net)} 원`}
                />
                <Box sx={{ position: "relative", width: "100%" }}>
                    <Badge
                        component="div"
                        color="error"
                        badgeContent={unsettledAll.count}
                        anchorOrigin={{ vertical: "top", horizontal: "left" }}
                        sx={{ width: "100%", display: "block" }}
                    >
                        <CardStat
                            variant="kpi" tone="warning"
                            icon="unsettled"
                            label="미정산 대기"
                            value={loadingCards ? "…" : `${currency(unsettledAll.amount)} 원`}
                            sub="완료 결제 전체 기준"
                            onClick={() => navigate("/admin/settlement/list")}
                        />
                    </Badge>
                </Box>
            </Box>

            {/* ───────── Section 1: 결제수단별 매출 비교 ───────── */}
            <Section
                title="결제수단별 매출 비교"
                actions={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <QuickRangeChips value={range} onChange={setRange} />
                    </Stack>
                }
            >
                <Box sx={{ height: chartHeight }}>
                    {loadingBar ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: chartHeight }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <ChartWrapper>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byMethod} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="method"
                                        stroke={theme.palette.mode === "dark" ? "#707070" : "#bbbbbb"}
                                        tickFormatter={(v) => ({ 
                                            kakaopay: "카카오페이", 
                                            tosspay: "토스페이", 
                                            danal: "신용카드", 
                                            phone: "휴대폰 결제", 
                                            unknown: "기타" }[v] || v)}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke={theme.palette.mode === "dark" ? "#707070" : "#bbbbbb"}
                                        tick={{ fontSize: 12, fill: theme.palette.mode === "dark" ? "#707070" : "#bbbbbb" }}
                                    />
                                    <ReTooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.mode === "dark" ? "#555" : "#ccc"}`,
                                            borderRadius: 6,
                                            boxShadow: theme.palette.mode === "dark" ? "0 2px 6px rgba(0,0,0,0.6)" : "0 2px 6px rgba(0,0,0,0.15)",
                                            padding: "12px 16px",
                                        }}
                                        itemStyle={{ fontSize: 12, margin: "4px 0", color: theme.palette.text.primary }}
                                        labelFormatter={(raw) => ({ 
                                            kakaopay: "카카오페이", 
                                            tosspay: "토스페이", 
                                            danal: "신용카드", 
                                            phone: "휴대폰 결제",
                                            unknown: "기타"
                                        }[raw] || raw)}
                                        formatter={(value, name) => [`${currency(value)} 원`, name]}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                    <Bar dataKey="fee" name="수수료" fill={BAR.fee} barSize={20} />
                                    <Bar dataKey="net" name="순정산" fill={BAR.net} barSize={20} />
                                    <Bar dataKey="gross" name="총매출" fill={BAR.gross} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                    )}
                </Box>
            </Section>

            {/* ───────── Section 2: 기간별 매출 추이 ───────── */}
            <Section
                title="기간별 매출 추이"
                actions={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <QuickTrendChips value={trendPreset} onChange={setTrendPreset} />
                    </Stack>
                }
            >
                <Box sx={{ height: chartHeight }}>
                    {loadingLine ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: chartHeight }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <ChartWrapper>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        stroke={theme.palette.mode === "dark" ? "#707070" : "#bbbbbb"}
                                        tick={{ fontSize: 12, fill: theme.palette.mode === "dark" ? "#707070" : "#bbbbbb" }}
                                    />
                                    <YAxis
                                        stroke={theme.palette.mode === "dark" ? "#707070" : "#bbbbbb"}
                                        tick={{ fontSize: 12, fill: theme.palette.mode === "dark" ? "#707070" : "#bbbbbb" }}
                                    />
                                    <ReTooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.mode === "dark" ? "#555" : "#ccc"}`,
                                            borderRadius: 6,
                                            boxShadow: theme.palette.mode === "dark" ? "0 2px 6px rgba(0,0,0,0.6)" : "0 2px 6px rgba(0,0,0,0.15)",
                                            padding: "12px 16px",
                                        }}
                                        itemStyle={{ fontSize: 12, margin: "4px 0", color: theme.palette.text.primary }}
                                        formatter={(v, n) => [`${currency(v)} 원`, n]}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                    {/* 항상 3개 라인 렌더링 */}
                                    <Line type="monotone" dataKey="gross" name="총매출" stroke={LINE.gross} dot />
                                    <Line type="monotone" dataKey="fee" name="수수료" stroke={LINE.fee} dot />
                                    <Line type="monotone" dataKey="net" name="순정산" stroke={LINE.net} dot />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                    )}
                </Box>
            </Section>

            {/* CTA */}
            <Box
                sx={{
                    position: "fixed",
                    right: { xs: 16, md: 24 },
                    bottom: { xs: 16, md: 24 },
                    zIndex: (t) => t.zIndex.drawer + 2,
                }}
            >
                <Tooltip title="미정산 내역 처리로 이동" placement="left">
                    <Badge
                        color="error"
                        badgeContent={unsettledAll.count}
                        overlap="circular"
                        sx={{
                            "& .MuiBadge-badge": {
                                top: { xs: -8, md: -10 },
                                right: -6,
                                transform: "none",
                            },
                        }}
                    >
                        <Paper
                            onClick={() => navigate("/admin/settlement/list")}
                            sx={{
                                p: 1.2,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                boxShadow: 6,
                                bgcolor: (t) => t.palette.primary.main,
                                color: (t) => t.palette.primary.contrastText,
                                "&:hover": { boxShadow: 10, transform: "translateY(-2px)" },
                                transition: "all .18s ease",
                            }}
                        >
                            <CheckCircle fontSize="small" />
                            <Typography variant="body2" fontWeight={700} pr={0.5}>정산 처리</Typography>
                        </Paper>
                    </Badge>
                </Tooltip>
            </Box>
        </Stack>
    );
}

/* helpers */
function getTrendWindow(preset) {
    const now = dayjs();
    if (preset === "7d") return { from: now.subtract(6, "day").startOf("day"), to: now.endOf("day"), interval: "DAY" };
    if (preset === "8w") return { from: now.subtract(7, "week").startOf("week"), to: now.endOf("week"), interval: "WEEK" };
    return { from: now.subtract(5, "month").startOf("month"), to: now.endOf("month"), interval: "MONTH" };
}
