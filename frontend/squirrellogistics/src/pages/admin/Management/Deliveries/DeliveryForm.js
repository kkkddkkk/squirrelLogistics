import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Stack, TextField, MenuItem, Button, Alert, Chip, Divider
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { createDelivery, fetchDeliveryById, updateDelivery } from "../../../../api/deliveries";

const STATUSES = [
  { label: "대기", value: "PENDING" },
  { label: "배차완료", value: "ASSIGNED" },
  { label: "픽업", value: "PICKED_UP" },
  { label: "이동중", value: "IN_TRANSIT" },
  { label: "배송완료", value: "DELIVERED" },
  { label: "취소", value: "CANCELED" },
];

export default function DeliveryForm() {
  const navigate = useNavigate();
  const { id }   = useParams();          // '/new' 라우트는 별도, 여기서는 숫자 id
  const isEdit   = !!id;                 // id가 있으면 수정

  const [form, setForm]     = useState(null); // 로딩 전 null
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [mockUsed, setMockUsed] = useState(false);

  // 초기값 (등록용)
  const initial = useMemo(() => ({
    orderNo: "",
    recipient: "",
    recipientPhone: "",
    origin: "",
    destination: "",
    driverId: "",
    vehicleId: "",
    scheduledAt: dayjs(),
    status: "PENDING",
    memo: "",
  }), []);

  // 목업 생성기
  const buildMock = (idVal) => ({
    orderNo: `ORD-${String(10000 + Number(idVal || 0))}`,
    recipient: "홍길동",
    recipientPhone: "010-1234-5678",
    origin: "서울 강남구",
    destination: "부산 해운대구",
    driverId: "DRV-01",
    vehicleId: "VEH-01",
    scheduledAt: dayjs(),
    status: "ASSIGNED",
    memo: "백엔드 없음 - 목업 데이터",
  });

  // 데이터 로드
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError("");
      setMockUsed(false);
      try {
        if (!isEdit) {
          if (mounted) setForm(initial);
        } else {
          const data = await fetchDeliveryById(id); // 백엔드 호출
          // data가 비어있거나 형태가 이상해도 목업으로 폴백
          if (!data || typeof data !== "object") {
            if (mounted) {
              setForm(buildMock(id));
              setMockUsed(true);
              setError("백엔드 데이터가 없어 목업으로 표시합니다.");
            }
          } else {
            if (mounted) {
              setForm({
                orderNo: data.orderNo ?? "",
                recipient: data.recipient ?? "",
                recipientPhone: data.recipientPhone ?? "",
                origin: data.origin ?? "",
                destination: data.destination ?? "",
                driverId: data.driverId ?? "",
                vehicleId: data.vehicleId ?? "",
                scheduledAt: data.scheduledAt ? dayjs(data.scheduledAt) : dayjs(),
                status: data.status ?? "PENDING",
                memo: data.memo ?? "",
              });
            }
          }
        }
      } catch (e) {
        // 통신 실패 → 목업 폴백
        if (mounted) {
          setForm(isEdit ? buildMock(id) : initial);
          setMockUsed(true);
          setError("서버 응답이 없어 목업 데이터로 표시합니다.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id, isEdit, initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    if (!form) return;
    const payload = {
      ...form,
      scheduledAt: form.scheduledAt ? form.scheduledAt.toISOString() : null,
    };

    try {
      if (mockUsed) {
        // 백엔드 없이 UX 유지: 성공처럼 동작
        alert(isEdit ? "수정(목업) 성공" : "등록(목업) 성공");
        navigate("/admin/management/deliveries");
        return;
      }

      if (isEdit) {
        await updateDelivery(id, payload);
        alert("수정되었습니다.");
      } else {
        await createDelivery(payload);
        alert("등록되었습니다.");
      }
      navigate("/admin/management/deliveries");
    } catch (e) {
      // 실제 서버 실패 시에도 목업 저장 시뮬레이션
      alert(isEdit ? "수정 실패 - 목업 저장으로 대체합니다." : "등록 실패 - 목업 저장으로 대체합니다.");
      navigate("/admin/management/deliveries");
    }
  };

  if (loading || !form) {
    return (
      <Box>
        <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700, mb: 2 }}>
          배송 {isEdit ? "수정" : "등록"}
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>불러오는 중...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700 }}>
          배송 {isEdit ? "수정" : "등록"}
        </Typography>
        {mockUsed && <Chip size="small" label="MOCK" color="warning" />}
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="주문번호"
                name="orderNo"
                value={form.orderNo}
                onChange={onChange}
                required
                disabled={isEdit}       // 수정일 때는 주문번호 변경 금지
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
                {STATUSES.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="수취인" name="recipient" value={form.recipient} onChange={onChange} sx={{ flex: 1 }} />
              <TextField label="수취인 연락처" name="recipientPhone" value={form.recipientPhone} onChange={onChange} sx={{ flex: 1 }} />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="출발지" name="origin" value={form.origin} onChange={onChange} sx={{ flex: 1 }} />
              <TextField label="도착지" name="destination" value={form.destination} onChange={onChange} sx={{ flex: 1 }} />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="드라이버 ID" name="driverId" value={form.driverId} onChange={onChange} sx={{ flex: 1 }} />
              <TextField label="차량 ID" name="vehicleId" value={form.vehicleId} onChange={onChange} sx={{ flex: 1 }} />
            </Stack>

            <DateTimePicker
              label="예약 일시"
              value={form.scheduledAt}
              onChange={(v) => setForm(prev => ({ ...prev, scheduledAt: v }))}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <TextField
              label="메모"
              name="memo"
              value={form.memo}
              onChange={onChange}
              multiline
              minRows={3}
            />

            <Divider />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => navigate(-1)}>취소</Button>
              <Button variant="contained" sx={{ bgcolor: "#E8A93F" }} onClick={onSubmit}>
                {isEdit ? "수정" : "등록"}
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
}
