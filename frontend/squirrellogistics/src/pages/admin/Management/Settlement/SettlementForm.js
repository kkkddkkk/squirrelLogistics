// src/pages/admin/Management/Settlement/SettlementForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { createSettlement, fetchSettlementById, updateSettlement } from "../../../../api/settlements";

const STATUSES = [
  { label: "대기", value: "PENDING" },
  { label: "승인", value: "APPROVED" },
  { label: "지급완료", value: "PAID" },
  { label: "취소", value: "CANCELED" },
];

export default function SettlementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    settlementNo: "",
    orderNo: "",
    partner: "",
    amount: "",
    fee: "",
    vat: "",
    status: "PENDING",
    settledAt: dayjs().format("YYYY-MM-DD"),
    memo: "",
  });

  const total = useMemo(() => {
    const amount = Number(form.amount || 0);
    const fee    = Number(form.fee || 0);
    const vat    = Number(form.vat || 0);
    return amount - fee + vat;
  }, [form.amount, form.fee, form.vat]);

  const load = async () => {
    if (!isEdit) return;
    try {
      const data = await fetchSettlementById(id);
      setForm({
        settlementNo: data.settlementNo || "",
        orderNo: data.orderNo || "",
        partner: data.partner || "",
        amount: data.amount ?? "",
        fee: data.fee ?? "",
        vat: data.vat ?? "",
        status: data.status || "PENDING",
        settledAt: data.settledAt || dayjs().format("YYYY-MM-DD"),
        memo: data.memo || "",
      });
    } catch {
      // mock
      setForm({
        settlementNo: `SET-${10000 + Number(id || 0)}`,
        orderNo: `ORD-${20000 + Number(id || 0)}`,
        partner: "A물류",
        amount: 150000,
        fee: 7500,
        vat: 15000,
        status: "APPROVED",
        settledAt: dayjs().format("YYYY-MM-DD"),
        memo: "목업",
      });
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async () => {
    try {
      const payload = { ...form };
      if (isEdit) {
        await updateSettlement(id, payload);
        alert("수정되었습니다.");
      } else {
        await createSettlement(payload);
        alert("등록되었습니다.");
      }
      navigate("/admin/management/settlement");
    } catch {
      alert(isEdit ? "수정 실패(목업)" : "등록 실패(목업)");
      navigate("/admin/management/settlement");
    }
  };

  const fm = (n) => (Number(n || 0)).toLocaleString();

  return (
    <Box>
      <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700, mb: 2 }}>
        정산 {isEdit ? "수정" : "등록"}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="정산번호"
              name="settlementNo"
              value={form.settlementNo}
              onChange={onChange}
              required
              disabled={isEdit}
              sx={{ flex: 1 }}
            />
            <TextField
              label="상태"
              name="status"
              select
              value={form.status}
              onChange={onChange}
              sx={{ minWidth: 200 }}
            >
              {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="주문번호" name="orderNo" value={form.orderNo} onChange={onChange} sx={{ flex: 1 }} />
            <TextField label="파트너명" name="partner" value={form.partner} onChange={onChange} sx={{ flex: 1 }} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="금액(원)" name="amount" type="number" value={form.amount} onChange={onChange} sx={{ flex: 1 }} />
            <TextField label="수수료(원)" name="fee" type="number" value={form.fee} onChange={onChange} sx={{ flex: 1 }} />
            <TextField label="부가세(원)" name="vat" type="number" value={form.vat} onChange={onChange} sx={{ flex: 1 }} />
          </Stack>

          {/* ✅ 자동 합계 미리보기 */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="정산합계(금액-수수료+부가세)"
              value={`₩ ${fm(total)}`}
              InputProps={{ readOnly: true }}
              sx={{ flex: 1, "& input": { fontWeight: 700, color: "#113F67" } }}
            />
            <TextField
              label="정산일(YYYY-MM-DD)"
              name="settledAt"
              value={form.settledAt}
              onChange={onChange}
              sx={{ flex: 1 }}
            />
          </Stack>

          <TextField label="메모" name="memo" value={form.memo} onChange={onChange} multiline minRows={3} />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button onClick={() => navigate(-1)}>취소</Button>
            <Button variant="contained" sx={{ bgcolor: "#E8A93F" }} onClick={onSubmit}>
              {isEdit ? "수정" : "등록"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
