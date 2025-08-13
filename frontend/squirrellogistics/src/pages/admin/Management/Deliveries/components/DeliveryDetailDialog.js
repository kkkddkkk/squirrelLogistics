import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Button, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DeliveryDetailDialog({ open, row, onClose }) {
  const navigate = useNavigate();
  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>배송 상세</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="주문번호" value={row.orderNo} InputProps={{ readOnly: true }} />
          <TextField label="수취인" value={row.recipient} InputProps={{ readOnly: true }} />
          <TextField label="출발지" value={row.origin} InputProps={{ readOnly: true }} />
          <TextField label="도착지" value={row.destination} InputProps={{ readOnly: true }} />
          <TextField label="드라이버" value={row.driver} InputProps={{ readOnly: true }} />
          <TextField label="차량" value={row.vehicle} InputProps={{ readOnly: true }} />
          <Stack direction="row" spacing={1}>
            <Chip label={`상태: ${row.status}`} />
            <Chip label={`ETA: ${row.eta}`} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#E8A93F" }}
          onClick={() => { onClose(); navigate(`/admin/management/deliveries/${row.id}`); }}
        >
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}
