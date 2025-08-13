import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, Box, Typography, Table, TableBody, TableRow, TableCell,
  Button, Stack, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const C = { blue: "#113F67", gold: "#E8A93F", grayBg: "#F5F7FA", line: "#E6EBF2" };
const colorByStatus = (s) => (s === "운행 가능" ? "success" : "warning");
const fmt = (n) => (n || n === 0 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
const safe = (v) => v ?? "";

export default function VehicleDetailDialog({ open, row, onClose }) {
  const navigate = useNavigate();
  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 7 }}>
        차량 상세
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip size="small" label={row.status} color={colorByStatus(row.status)} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", borderColor: C.line }}>
          <Box sx={{ bgcolor: C.grayBg, px: 2.5, py: 1.5, borderBottom: `1px solid ${C.line}` }}>
            <Typography sx={{ fontWeight: 700, color: C.blue }}>차량 정보</Typography>
          </Box>
          <Table size="small">
            <TableBody>
              <KV k="차량번호" v={row.vehicleNumber} />
              <KV k="기사명" v={row.driverName} />
              <KV k="최초등록일자" v={row.firstRegistrationDate} />
              <KV k="차종" v={row.vehicleType} />
              <KV k="최대 적재량" v={`${fmt(row.loadCapacityKg)} kg`} />
              <KV k="차량상태" v={row.status} />
              <KV k="현재 주행거리" v={`${fmt(row.currentDistanceKm)} km`} />
              <KV k="마지막 점검일" v={row.lastInspectionDate} />
              <KV k="다음 정비 예정일" v={row.nextInspectionDate} />
              <KV k="보험유무" v={row.insurance} />
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: C.gold, color: C.gold }}>닫기</Button>
        <Button
          variant="contained"
          onClick={() => { onClose(); navigate(String(row.id)); }}
          sx={{ bgcolor: C.blue, "&:hover": { bgcolor: "#0d2f4d" } }}
        >
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function KV({ k, v }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 180, bgcolor: "#F5F7FA", borderRight: "1px solid #E6EBF2", fontWeight: 600 }}>
        {k}
      </TableCell>
      <TableCell>{safe(v)}</TableCell>
    </TableRow>
  );
}
