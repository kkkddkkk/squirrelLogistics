import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, Box, Typography, IconButton, Table, TableBody, TableRow, TableCell,
  Button, Stack, Chip, Avatar, Link as MLink, Rating
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

const C = { blue: "#113F67", gold: "#E8A93F", grayBg: "#F5F7FA", line: "#E6EBF2" };
const roleColor = (role) =>
  role === "ADMIN" ? "primary" : role === "MANAGER" ? "secondary" : role === "DRIVER" ? "info" : "default";
const statusColor = (s) => (s === "ACTIVE" ? "success" : "warning");
const fmtNumber = (v) => (v || v === 0 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
const maskDigits = (v) => (v ? String(v).replace(/\d/g, "•") : "");
const safe = (v) => v ?? "";

export default function UserDetailDialog({ open, row, onClose }) {
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);
  if (!row) return null;

  const isDriver = (row.userType ?? row.role) === "DRIVER";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 7 }}>
        사용자 상세
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          <Chip size="small" label={`유형: ${isDriver ? "배송기사" : "물류회사"}`} />
          <Chip size="small" label={`권한: ${row.role ?? (isDriver ? "DRIVER" : "-")}`} color={roleColor(row.role)} />
          <Chip size="small" label={`상태: ${row.status ?? "-"}`} color={statusColor(row.status)} />
        </Stack>
        <IconButton
          size="small"
          onClick={() => { onClose(); navigate(`/admin/management/users/${row.id}`); }}
          sx={{ position: "absolute", right: 12, top: 12, color: C.blue }}
          aria-label="edit"
        >
          <EditIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isDriver
          ? <DriverPanel row={row} showAccount={showAccount} setShowAccount={setShowAccount} />
          : <CompanyPanel row={row} showAccount={showAccount} setShowAccount={setShowAccount} />
        }
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: C.gold, color: C.gold }}>닫기</Button>
        <Button
          variant="contained"
          onClick={() => { onClose(); navigate(`/admin/management/users/${row.id}`); }}
          sx={{ bgcolor: C.blue, "&:hover": { bgcolor: "#0d2f4d" } }}
        >
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ───────── 물류회사 ───────── */
function CompanyPanel({ row, showAccount, setShowAccount }) {
  const companyName   = row.companyName ?? row.name ?? "";
  const username      = row.username ?? "";
  const email         = row.email ?? "";
  const phone         = row.phone ?? "";
  const address       = row.address ?? "";
  const addressDetail = row.addressDetail ?? "";
  const bizRegNo      = row.bizRegNo ?? "";
  const mainAccount   = row.mainAccount ?? "";

  return (
    <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: "hidden", borderColor: C.line }}>
      <SectionHeader>회원정보</SectionHeader>
      <Table size="small">
        <TableBody>
          <KVRow k="회사명" v={companyName} />
          <KVRow k="아이디" v={username} />
          <KVRow k="이메일" v={email} />
          <KVRow k="연락처" v={phone} />
          <KVRow k="주소" v={address} />
          <KVRow k="상세주소" v={addressDetail} />
          <KVRow k="사업자 등록번호" v={bizRegNo} />
          <TableRow>
            <KeyCell>메인 계좌</KeyCell>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ mr: 1 }}>
                  {showAccount ? safe(mainAccount) : maskDigits(mainAccount)}
                </Typography>
                {mainAccount && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setShowAccount((v) => !v)}
                    sx={{ bgcolor: C.gold, minWidth: 64, "&:hover": { bgcolor: "#d38f2f" } }}
                  >
                    {showAccount ? "숨기기" : "보기"}
                  </Button>
                )}
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

/* ───────── 운전자 ───────── */
function DriverPanel({ row, showAccount, setShowAccount }) {
  // 헤더
  const name    = row.driverName ?? row.name ?? "";
  const rating  = Number(row.rating ?? 4.3);
  const tagline = row.tagline ?? "오늘도 안전운전하세요!";

  // 기본/개인
  const username  = row.username ?? "";
  const birth     = row.birth ?? "";
  const phone     = row.phone ?? "";
  const email     = row.email ?? "";
  const account   = row.account ?? "";
  const bizNo     = row.bizRegNo ?? "";

  // 차량/면허
  const vehicleType  = row.vehicleType ?? "";
  const vehicleNo    = row.vehicleNumber ?? "";
  const licenseNo    = row.driverLicenseNo ?? "";
  const licenseUntil = row.licenseValidUntil ?? "";
  const mileage      = row.currentDistance ?? 0;
  const lastInsp     = row.lastInspection ?? "";
  const nextInsp     = row.nextInspection ?? "";
  const insurance    = row.insurance ?? "";

  // 선호
  const preferredStart  = row.preferredStart ?? "";
  const preferredEnd    = row.preferredEnd ?? "";
  const preferredRegions = row.preferredRegions ?? [];

  return (
    <Stack spacing={2}>
      {/* 프로필 카드 */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: C.line }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{name} 기사님</Typography>
              <Typography sx={{ color: "#555" }}>{tagline}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 600 }}>별점</Typography>
            <Rating
              value={rating}
              precision={0.1}
              readOnly
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
            <Typography sx={{ fontWeight: 700 }}>{rating.toFixed(1)}</Typography>
            <MLink component="button" type="button" sx={{ ml: 2, color: C.blue, fontWeight: 600 }}>
              나의 리뷰 보기 ▶
            </MLink>
          </Stack>
        </Stack>
      </Paper>

      {/* 개인 정보 */}
      <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: "hidden", borderColor: C.line }}>
        <SectionHeader>운전자 개인 정보</SectionHeader>
        <Table size="small"><TableBody>
          <KVRow k="이름" v={name} />
          <KVRow k="아이디" v={username} />
          <KVRow k="생년월일" v={birth} />
          <KVRow k="연락처" v={phone} />
          <KVRow k="이메일" v={email} />
          <KVRow
            k="계좌번호"
            v={showAccount ? account : maskDigits(account)}
            trailing={account && (
              <Button size="small" variant="contained"
                onClick={() => setShowAccount(v => !v)}
                sx={{ bgcolor: C.gold, minWidth: 64, ml: 1, "&:hover": { bgcolor: "#d38f2f" } }}
              >
                {showAccount ? "숨기기" : "보기"}
              </Button>
            )}
          />
          <KVRow k="사업자 등록 번호" v={bizNo} />
        </TableBody></Table>
      </Paper>

      {/* 차량/면허 정보 */}
      <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: "hidden", borderColor: C.line }}>
        <SectionHeader>운송 차량 & 면허 정보</SectionHeader>
        <Table size="small"><TableBody>
          <KVRow k="차종" v={vehicleType} />
          <KVRow k="차량 번호" v={vehicleNo} />
          <KVRow k="운전면허증 번호" v={licenseNo} />
          <KVRow k="운전면허 유효기간" v={licenseUntil} />
          <KVRow k="현재 주행거리" v={`${fmtNumber(mileage)} km`} />
          <KVRow k="마지막 정비일" v={lastInsp} />
          <KVRow k="다음 정비 예정일" v={nextInsp} />
          <KVRow k="보험유무" v={insurance} />
        </TableBody></Table>
      </Paper>

      {/* 선호 정보 */}
      <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, overflow: "hidden", borderColor: C.line }}>
        <SectionHeader>선호 정보</SectionHeader>
        <Table size="small"><TableBody>
          <KVRow k="선호 시간대" v={`${safe(preferredStart)} ~ ${safe(preferredEnd)}`} />
          <TableRow>
            <KeyCell>운행 선호 지역</KeyCell>
            <TableCell>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {(preferredRegions || []).length
                  ? preferredRegions.map((r) => <Chip key={r} size="small" label={r} />)
                  : <Typography>—</Typography>}
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody></Table>
      </Paper>
    </Stack>
  );
}

/* 공통 */
function SectionHeader({ children }) {
  return (
    <Box sx={{ bgcolor: C.grayBg, px: 2.5, py: 1.5, borderBottom: `1px solid ${C.line}` }}>
      <Typography sx={{ fontWeight: 700, color: C.blue }}>{children}</Typography>
    </Box>
  );
}
function KVRow({ k, v, trailing }) {
  return (
    <TableRow>
      <KeyCell>{k}</KeyCell>
      <TableCell>
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <Typography>{safe(v)}</Typography>
          {trailing}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
function KeyCell({ children }) {
  return (
    <TableCell sx={{ width: 180, bgcolor: C.grayBg, borderRight: `1px solid ${C.line}`, fontWeight: 600 }}>
      {children}
    </TableCell>
  );
}
