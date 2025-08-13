// src/pages/admin/Dashboard/Dashboard.jsx
import React, { useMemo, useState } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, Chip, Container, IconButton, Menu, MenuItem, Avatar, Badge
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

/** ---------------- Routing ---------------- */
const ROUTE_MAP = {
  가입한회원수: "/admin/management/users",
  총배송건수: "/admin/management/deliveries",
  미처리된신고: "/admin/support/inquiry",
  최근주문전체보기: "/admin/management/deliveries",
};

/** ---------------- Mock Data ---------------- */
const kpis = [
  { key: "가입한회원수",  label: "가입한 회원 수", value: 525, unit: "명",  icon: <PeopleAltRoundedIcon /> },
  { key: "총배송건수",    label: "총 배송 건수",   value: 525, unit: "건",  icon: <LocalShippingRoundedIcon /> },
  { key: "미처리된신고",  label: "미 처리된 신고", value: 12,  unit: "건",  icon: <ReportProblemRoundedIcon /> },
];

const chartData = [
  { label: "월1", valueA: 120, valueB: 150 },
  { label: "월2", valueA: 95,  valueB: 130 },
  { label: "월3", valueA: 140, valueB: 160 },
  { label: "월4", valueA: 110, valueB: 135 },
];

const recentRows = [
  { id: "ORD-20101", customer: "홍길동", partner: "Squirrel Logistics", amount: 38000, status: "Delivered" },
  { id: "ORD-20102", customer: "김철수", partner: "Acorn Express",      amount: 52000, status: "Pending"   },
  { id: "ORD-20103", customer: "이영희", partner: "Acorn Express",      amount: 21000, status: "Canceled"  },
  { id: "ORD-20104", customer: "박가영", partner: "Squirrel Logistics", amount: 69000, status: "Delivered" },
  { id: "ORD-20105", customer: "최현우", partner: "Squirrel Logistics", amount: 47000, status: "Pending"   },
];

const statusColor = (s) => (s === "Delivered" ? "success" : s === "Pending" ? "warning" : "default");
const KRW = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 });
const money = (n) => KRW.format(n);

/** ---------------- Shared UI ---------------- */
const PALETTE = {
  primary: "#113F67",
  accent: "#E8A93F",
  bg: "#F5F7FA",
  border: "#E6ECF3",
  text: "#2A2A2A",
  muted: "#6B7A90",
};

function Section({ id, title, subtitle, children, right }) {
  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 3,
        p: { xs: 2, md: 2.5 },
        mb: 2.5,
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Box sx={{ width: 6, height: 28, borderRadius: 2, bgcolor: PALETTE.accent }} />
          <Box>
            <Typography sx={{ fontWeight: 800, color: PALETTE.primary }}>{title}</Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 12, color: PALETTE.muted, mt: 0.3 }}>{subtitle}</Typography>
            )}
          </Box>
        </Stack>
        {right}
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      {children}
    </Paper>
  );
}

/** SVG 막대차트 — 중앙 정렬 + 반응형 */
function SimpleBarChart({ data, height = 320, maxValue }) {
  const paddingX = 48;
  const paddingY = 40;
  const barWidth = 20;
  const groupGap = 36;
  const seriesGap = 12;

  const max = useMemo(
    () => maxValue ?? Math.max(...data.flatMap((d) => [d.valueA, d.valueB])) * 1.25,
    [data, maxValue]
  );

  const totalGroups = data.length;
  const svgWidth = paddingX * 2 + totalGroups * (barWidth * 2 + seriesGap) + (totalGroups - 1) * groupGap;
  const scaleY = (v) => (height - paddingY * 1.6) * (v / max);

  return (
    <Box sx={{ width: "100%" }}>
      {/* svg를 가운데 배치 */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: svgWidth }}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${svgWidth} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block" }}
            aria-label="정산 추세 막대 차트"
            role="img"
          >
            {/* 수평 가이드라인 */}
            {Array.from({ length: 4 }).map((_, i) => {
              const y = paddingY + i * ((height - paddingY * 1.6) / 3);
              return <line key={i} x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#EDF2F7" />;
            })}
            {/* x축 */}
            <line x1={paddingX} y1={height - paddingY} x2={svgWidth - paddingX} y2={height - paddingY} stroke="#D7DEE8" />

            {/* 막대 + 라벨 */}
            {data.map((d, i) => {
              const groupStart = paddingX + i * (barWidth * 2 + seriesGap + groupGap);
              const xA = groupStart;
              const xB = xA + barWidth + seriesGap;
              const hA = scaleY(d.valueA);
              const hB = scaleY(d.valueB);
              const yA = height - paddingY - hA;
              const yB = height - paddingY - hB;

              return (
                <g key={i}>
                  <rect x={xA} y={yA} width={barWidth} height={hA} rx="6" fill={PALETTE.primary}>
                    <title>{`${d.label} (이번달): ${d.valueA.toLocaleString()}`}</title>
                  </rect>
                  <rect x={xB} y={yB} width={barWidth} height={hB} rx="6" fill={PALETTE.accent}>
                    <title>{`${d.label} (지난달): ${d.valueB.toLocaleString()}`}</title>
                  </rect>
                  <text
                    x={xA + barWidth + seriesGap / 2}
                    y={height - paddingY + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill={PALETTE.muted}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </Box>

      {/* 범례 */}
      <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: PALETTE.primary }} />
          <Typography sx={{ fontSize: 12, color: PALETTE.text }}>이번달</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: PALETTE.accent }} />
          <Typography sx={{ fontSize: 12, color: PALETTE.text }}>지난달</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

/** KPI 카드 */
function KpiCard({ kpi, onClick, trend = "+3.2%" }) {
  return (
    <Paper
      role="button"
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${PALETTE.border}`,
        bgcolor: "#fff",
        cursor: "pointer",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 28px rgba(17,63,103,.12)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Avatar variant="rounded" sx={{ bgcolor: "#EDF4FF", color: PALETTE.primary, width: 40, height: 40 }}>
          {kpi.icon}
        </Avatar>
        <Chip
          icon={<TrendingUpRoundedIcon />}
          label={trend}
          size="small"
          sx={{ bgcolor: "rgba(232,169,63,.12)", color: PALETTE.accent, fontWeight: 700 }}
        />
      </Stack>
      <Typography sx={{ mt: 1.5, fontSize: 13, color: PALETTE.muted }}>{kpi.label}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: 30, fontWeight: 900, color: PALETTE.text, lineHeight: 1.1 }}>
        {kpi.value}
        <Typography component="span" sx={{ fontSize: 14, color: PALETTE.muted, ml: 0.5 }}>
          {kpi.unit}
        </Typography>
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 12, color: PALETTE.muted }}>상세 보기</Typography>
    </Paper>
  );
}

/** ---------------- Page ---------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState("이번 달");

  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const totalAmount = useMemo(
    () => recentRows.reduce((sum, r) => sum + r.amount, 0),
    []
  );

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 1, md: 2 } }}>
      {/* 페이지 헤더 */}
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: `1px solid ${PALETTE.border}`,
          background: `linear-gradient(180deg, rgba(17,63,103,.06) 0%, rgba(17,63,103,0) 100%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: PALETTE.primary }}>
              대시보드
            </Typography>
            <Badge
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: PALETTE.primary,
                },
              }}
              badgeContent={
                <Typography sx={{ px: 1, fontSize: 11, fontWeight: 700, color: "#fff" }}>
                  {range}
                </Typography>
              }
            >
              <Box />
            </Badge>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setRange((r) => (r === "이번 달" ? "지난 달" : "이번 달"))}
              sx={{
                borderColor: PALETTE.primary,
                color: PALETTE.primary,
                textTransform: "none",
                "&:hover": { borderColor: "#0E3453", color: "#0E3453" },
              }}
            >
              기간: {range}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => window.location.reload()}
              sx={{ bgcolor: PALETTE.primary, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#0E3453" } }}
            >
              새로고침
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreHorizRoundedIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleMenuClose(); navigate(ROUTE_MAP.최근주문전체보기); }}>
                배송 목록 열기
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate(ROUTE_MAP.가입한회원수); }}>
                회원 관리 열기
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate(ROUTE_MAP.미처리된신고); }}>
                문의함 열기
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        {/* 상단 요약 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1, color: PALETTE.muted }}>
          <Typography sx={{ fontSize: 13 }}>
            총 최근 주문 금액: <b style={{ color: PALETTE.text }}>{money(totalAmount)}</b>
          </Typography>
          <Box sx={{ display: { xs: "none", md: "block" } }}>•</Box>
          <Typography sx={{ fontSize: 13 }}>실시간 데이터는 5분 간격으로 갱신됩니다.</Typography>
        </Stack>
      </Paper>

      {/* === 세로 스택: 핵심 지표 → 정산 추세 → 최근 배송 현황 === */}
      <Grid container spacing={2.5}>
        {/* 1) 핵심 지표 */}
        <Grid item xs={12}>
          <Section
            id="cards"
            title="핵심 지표"
            subtitle="서비스의 현재 상태 요약"
            right={<Typography sx={{ color: PALETTE.muted, fontSize: 12 }}>클릭 시 상세로 이동</Typography>}
          >
            <Grid container spacing={1.5}>
              {kpis.map((k) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={k.key}>
                  <KpiCard
                    kpi={k}
                    onClick={() =>
                      navigate(
                        k.key === "가입한회원수" ? ROUTE_MAP.가입한회원수 :
                        k.key === "총배송건수" ? ROUTE_MAP.총배송건수 :
                        ROUTE_MAP.미처리된신고
                      )
                    }
                  />
                </Grid>
              ))}
              {/* 빠른 작업 카드 */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${PALETTE.border}`,
                    bgcolor: "#fff",
                    height: "100%",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: PALETTE.muted, mb: 1 }}>빠른 작업</Typography>
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      onClick={() => navigate(ROUTE_MAP.최근주문전체보기)}
                      variant="outlined"
                      endIcon={<OpenInNewRoundedIcon />}
                      sx={{ borderColor: PALETTE.primary, color: PALETTE.primary, textTransform: "none" }}
                    >
                      최근 배송 전체 보기
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate(ROUTE_MAP.가입한회원수)}
                      variant="outlined"
                      endIcon={<OpenInNewRoundedIcon />}
                      sx={{ borderColor: PALETTE.primary, color: PALETTE.primary, textTransform: "none" }}
                    >
                      사용자 관리
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 2) 정산 추세 */}
        <Grid item xs={12}>
          <Section
            id="chart"
            title="정산 추세"
            subtitle="이번달 vs 지난달"
            right={
              <Stack direction="row" spacing={1}>
                <Chip label="이번달" size="small" sx={{ bgcolor: PALETTE.primary, color: "#fff" }} />
                <Chip label="지난달" size="small" sx={{ bgcolor: PALETTE.accent, color: "#fff" }} />
              </Stack>
            }
          >
            <SimpleBarChart data={chartData} height={360} />
          </Section>
        </Grid>

        {/* 3) 최근 배송 현황 */}
        <Grid item xs={12}>
          <Section
            id="list"
            title="최근 배송 현황"
            subtitle="가장 최신 순으로 정렬"
            right={
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(ROUTE_MAP.최근주문전체보기)}
                sx={{
                  borderColor: PALETTE.primary, color: PALETTE.primary, textTransform: "none",
                  "&:hover": { borderColor: "#0E3453", color: "#0E3453" }
                }}
              >
                전체 보기
              </Button>
            }
          >
            <Table size="small" aria-label="최근 배송 테이블">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="col" sx={{ color: PALETTE.muted, fontWeight: 700 }}>주문번호</TableCell>
                  <TableCell component="th" scope="col" sx={{ color: PALETTE.muted, fontWeight: 700 }}>고객</TableCell>
                  <TableCell component="th" scope="col" sx={{ color: PALETTE.muted, fontWeight: 700 }}>파트너</TableCell>
                  <TableCell component="th" scope="col" align="right" sx={{ color: PALETTE.muted, fontWeight: 700 }}>금액</TableCell>
                  <TableCell component="th" scope="col" sx={{ color: PALETTE.muted, fontWeight: 700 }}>상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    tabIndex={0}
                    onClick={() => navigate(ROUTE_MAP.최근주문전체보기)}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(ROUTE_MAP.최근주문전체보기); }}
                    sx={{ cursor: "pointer", "&:hover td": { backgroundColor: "#FAFCFF" } }}
                  >
                    <TableCell>{r.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 26, height: 26, bgcolor: "#E9EEF5", color: PALETTE.primary }}>
                          {r.customer[0]}
                        </Avatar>
                        <Typography sx={{ fontSize: 13 }}>{r.customer}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{r.partner}</TableCell>
                    <TableCell align="right">{money(r.amount)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status} color={statusColor(r.status)} sx={{ fontWeight: 700 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </Grid>
      </Grid>
    </Container>
  );
}
