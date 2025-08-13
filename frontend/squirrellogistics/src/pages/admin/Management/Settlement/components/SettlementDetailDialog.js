// src/pages/admin/Management/Settlement/components/SettlementDetailDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Button, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SettlementDetailDialog({ open, row, onClose }) {
  const navigate = useNavigate();
  if (!row) return null;

  const money = (n) => (n ?? 0).toLocaleString();
  const total = (row.amount ?? 0) - (row.fee ?? 0) + (row.vat ?? 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>정산 상세</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="정산번호" value={row.settlementNo} InputProps={{ readOnly: true }} />
          <TextField label="주문번호" value={row.orderNo} InputProps={{ readOnly: true }} />
          <TextField label="파트너" value={row.partner} InputProps={{ readOnly: true }} />
          <TextField label="금액(₩)" value={money(row.amount)} InputProps={{ readOnly: true }} />
          <TextField label="수수료(₩)" value={money(row.fee)} InputProps={{ readOnly: true }} />
          <TextField label="부가세(₩)" value={money(row.vat)} InputProps={{ readOnly: true }} />
          <TextField label="합계(₩)" value={money(total)} InputProps={{ readOnly: true }} />
          <Stack direction="row" spacing={1}>
            <Chip label={`상태: ${row.status}`} />
            <Chip label={`정산일: ${row.settledAt}`} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#E8A93F" }}
          onClick={() => { onClose(); navigate(`/admin/management/settlement/${row.id}`); }}
        >
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}
