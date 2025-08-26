import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from "@mui/material";

export default function PaymentDialog({ open, onClose, onConfirm, amount }) {
  const [method, setMethod] = useState("CARD");

  const handleConfirm = () => {
    const now = new Date();
    const format = (d) => d.toISOString().slice(0, 19).replace("T", " "); // yyyy-MM-dd HH:mm:ss

    const payment = {
      paid: format(now),
      payAmount: amount,
      payMethod: method,
      payStatus: "COMPLETED",
      prepaidId: null,
      refundDate: null,
      settlement: false,
      settlementFee: 0
    };

    onConfirm(payment);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>결제 정보 입력</DialogTitle>
      <DialogContent>
        <p>결제 금액: {amount.toLocaleString()}원</p>
        <TextField select fullWidth label="결제 수단" value={method} onChange={e => setMethod(e.target.value)} margin="normal">
          <MenuItem value="CARD">카드</MenuItem>
          <MenuItem value="BANK">계좌이체</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleConfirm}>결제하기</Button>
      </DialogActions>
    </Dialog>
  );
}