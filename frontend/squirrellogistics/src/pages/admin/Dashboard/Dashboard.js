// src/pages/admin/Dashboard/Dashboard.jsx
import React, { useMemo } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, Chip, Tooltip, Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";

/** ---------------- Routing ---------------- */
const ROUTE_MAP = {
  가입한회원수: "/admin/management/users",
  총배송건수: "/admin/management/deliveries",
  미처리된신고: "/admin/support/inquiry",
  최근주문전체보기: "/admin/management/deliveries",
};

/** ---------------- Mock Data ---------------- */
const kpis = [
  { key: "가입한회원수",  label: "가입한 회원 수", value: 525, unit: "명" },
  { key: "총배송건수",    label: "총 배송 건수",   value: 525, unit: "건" },
  { key: "미처리된신고",  label: "미 처리된 신고", value: 12,  unit: "건" },
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
const money = (n) => `₩ ${n.toLocaleString()}`;

/** ---------------- Components ---------------- */
function Section({ id, title, children, right }) {
  return (
    <Paper id={id} elevation={0} sx={{ border: "1px solid #E6ECF3", borderRadius: 3, p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Box sx={{ width: 6, height: 26, borderRadius: 2, bgcolor: "#E8A93F" }} />
          <Typography sx={{ fontWeight: 800, color: "#113F67" }}>{title}</Typography>
        </Stack>
        {right}
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      {children}
    </Paper>
  );
}

/** SVG 막대차트 — 중앙 정렬 (크기 유지) */
function SimpleBarChart({ data, height = 300, maxValue }) {
  const padding = 44;
  const barWidth = 28;
  const gap = 48;

  const max = useMemo(
    () => maxValue ?? Math.max(...data.flatMap((d) => [d.valueA, d.valueB])) * 1.25,
    [data, maxValue]
  );

  const totalBars = data.length * 2;
  const svgWidth = padding * 2 + totalBars * barWidth + (data.length - 1) * gap; // ← 실제 픽셀 너비
  const scaleY = (v) => (height - padding * 1.6) * (v / max);

  return (
    // 부모를 flex-center로, SVG는 고정 px 너비로 → 화면 가운데 배치
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <svg
        width={svgWidth}                                 // ← 고정 px (크기 유지)
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "100%", height: "auto", display: "block" }} // 좁은 화면에서만 축소
      >
        {/* 가이드 라인 */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = padding + i * ((height - padding * 1.6) / 3);
          return <line key={i} x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#E6ECF3" />;
        })}
        {/* x축 */}
        <line x1={padding} y1={height - padding} x2={svgWidth - padding} y2={height - padding} stroke="#D7DEE8" />

        {/* 막대 + 라벨 */}
        {data.map((d, i) => {
          const xA = padding + i * (barWidth * 2 + gap);
          const xB = xA + barWidth;
          const hA = scaleY(d.valueA);
          const hB = scaleY(d.valueB);
          const yA = height - padding - hA;
          const yB = height - padding - hB;

          return (
            <g key={i}>
              <rect x={xA} y={yA} width={barWidth} height={hA} rx="6" fill="#113F67" />
              <rect x={xB} y={yB} width={barWidth} height={hB} rx="6" fill="#E8A93F" />
              <text x={xA + barWidth} y={height - padding + 22} textAnchor="middle" fontSize="12" fill="#6B7A90">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}


/** KPI 카드 */
function KpiCard({ kpi, onClick }) {
  return (
    <Tooltip title={`${kpi.label} 이동`} arrow placement="top">
      <Paper
        role="button"
        onClick={onClick}
        elevation={0}
        sx={{
          height: 140,
          width:200,
          borderRadius: 3,          
          border: "1px solid #E6ECF3",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform .15s ease, box-shadow .15s ease",
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 28px rgba(17,63,103,.12)" },
        }}
      >
        <Box sx={{ bgcolor: "#9EB9D7", color: "#fff", py: 1.6, textAlign: "center" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{kpi.label}</Typography>
        </Box>
        <Box sx={{ py: 2.2, textAlign: "center", bgcolor: "#fff" }}>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#2A2A2A", lineHeight: 1 }}>
            {kpi.value}
            <Typography component="span" sx={{ fontSize: 16, color: "#6B7A90", ml: .5 }}>
              {kpi.unit}
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Tooltip>
  );
}

/** ---------------- Page ---------------- */
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth={false} disableGutters sx={{ px: { xs: 1.5, md: 2.5 }, py: { xs: 1, md: 1.5 } }}>
      {/* Quick Nav */}
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" href="#cards" sx={{ textTransform: "none", borderColor: "#113F67", color: "#113F67" }}>카드형</Button>
        <Button size="small" variant="outlined" href="#chart" sx={{ textTransform: "none", borderColor: "#113F67", color: "#113F67" }}>차트형</Button>
        <Button size="small" variant="outlined" href="#list" sx={{ textTransform: "none", borderColor: "#113F67", color: "#113F67" }}>리스트형</Button>
        <Button variant="contained" onClick={() => window.location.reload()}
          sx={{ ml: 1, bgcolor: "#113F67", "&:hover": { bgcolor: "#0E3453" }, textTransform: "none", fontWeight: 700 }}>
          새로고침
        </Button>
      </Stack>

      {/* 영역 1: 카드형 */}
      <Section
        id="cards"
        title="카드형 (KPI)"
        right={<Typography sx={{ color: "#6B7A90", fontSize: 13 }}>클릭 시 관련 페이지로 이동</Typography>}
      >
        <Grid container spacing={4} justifyContent="center">
          {kpis.map((k) => (
            // <Grid key={k.key} item xs={15} md={10}>
            <Grid key={k.key} item>
              <KpiCard
                kpi={k}
                onClick={() => {
                  const path =
                    k.key === "가입한회원수" ? ROUTE_MAP.가입한회원수
                    : k.key === "총배송건수" ? ROUTE_MAP.총배송건수
                    : ROUTE_MAP.미처리된신고;
                  navigate(path);
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* 영역 2: 차트형 */}
      <Section
        id="chart"
        title="차트형 (정산)"
        right={
          <Stack direction="row" spacing={1}>
            <Chip label="이번달" size="small" sx={{ bgcolor: "#113F67", color: "#fff" }} />
            <Chip label="지난달" size="small" sx={{ bgcolor: "#E8A93F", color: "#fff" }} />
          </Stack>
        }
      >
        <Box sx={{ width: "100%", overflow: "hidden" }}>
          <SimpleBarChart data={chartData} height={500} />
        </Box>
      </Section>

      {/* 영역 3: 리스트형 */}
      <Section
        id="list"
        title="리스트형 (배송 현황)"
        right={
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(ROUTE_MAP.최근주문전체보기)}
            sx={{ borderColor: "#113F67", color: "#113F67", textTransform: "none",
                  "&:hover": { borderColor: "#0E3453", color: "#0E3453" } }}
          >
            전체 보기
          </Button>
        }
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#6B7A90", fontWeight: 700 }}>주문번호</TableCell>
              <TableCell sx={{ color: "#6B7A90", fontWeight: 700 }}>고객</TableCell>
              <TableCell sx={{ color: "#6B7A90", fontWeight: 700 }}>파트너</TableCell>
              <TableCell align="right" sx={{ color: "#6B7A90", fontWeight: 700 }}>금액</TableCell>
              <TableCell sx={{ color: "#6B7A90", fontWeight: 700 }}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentRows.map((r) => (
              <TableRow
                key={r.id}
                hover
                onClick={() => navigate(ROUTE_MAP.최근주문전체보기)}
                sx={{ cursor: "pointer", "&:hover td": { backgroundColor: "#FAFCFF" } }}
              >
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.customer}</TableCell>
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
    </Container>
  );
}
