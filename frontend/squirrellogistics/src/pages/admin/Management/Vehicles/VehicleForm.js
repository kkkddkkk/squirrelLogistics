// src/pages/admin/Management/Vehicles/VehicleForm.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  createVehicle,
  fetchVehicleById,
  updateVehicle,
} from "../../../../api/vehicles";

const C = { blue: "#113F67", gold: "#E8A93F" };
const STATUS = ["운행 가능", "정비중"];
const TYPES = ["윙바디", "탑차", "카고"];

// 1,234 같은 천단위 콤마 입력 보조
const fmtNum = (s = "") =>
  String(s)
    .replace(/[^\d]/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const toNumber = (s = "") => Number(String(s).replaceAll(",", "") || 0);

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // /new 에서는 undefined, /:id 에서는 값 존재
  const isEdit = !!id;

  const [form, setForm] = useState({
    vehicleNumber: "",
    driverName: "",
    firstRegistrationDate: "",
    vehicleType: "",
    loadCapacityKg: "",
    status: "운행 가능",
    currentDistanceKm: "",
    lastInspectionDate: "",
    nextInspectionDate: "",
    insurance: "유",
  });

  const [loading, setLoading] = useState(isEdit); // 수정일 때만 초기 로딩
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 수정 모드: 상세 불러오기
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const data = await fetchVehicleById(id);
        if (ignore) return;
        if (!data) {
          setError("데이터를 찾을 수 없습니다.");
          return;
        }
        setForm({
          vehicleNumber: data.vehicleNumber || "",
          driverName: data.driverName || "",
          firstRegistrationDate: data.firstRegistrationDate || "",
          vehicleType: data.vehicleType || "",
          loadCapacityKg: fmtNum(data.loadCapacityKg ?? ""),
          status: data.status || "운행 가능",
          currentDistanceKm: fmtNum(data.currentDistanceKm ?? ""),
          lastInspectionDate: data.lastInspectionDate || "",
          nextInspectionDate: data.nextInspectionDate || "",
          insurance: data.insurance || "유",
        });
      } catch (e) {
        console.error(e);
        setError("상세 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "loadCapacityKg" || name === "currentDistanceKm") {
      setForm((prev) => ({ ...prev, [name]: fmtNum(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async () => {
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        loadCapacityKg: toNumber(form.loadCapacityKg),
        currentDistanceKm: toNumber(form.currentDistanceKm),
      };

      if (isEdit) {
        await updateVehicle(id, payload);
        alert("수정되었습니다.");
      } else {
        await createVehicle(payload);
        alert("등록되었습니다.");
      }
      navigate("/admin/management/vehicles");
    } catch (e) {
      console.error(e);
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography>불러오는 중…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ color: C.blue, fontWeight: 700, mb: 2 }}>
        차량 {isEdit ? "수정" : "등록"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="차량번호"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={onChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="기사명"
              name="driverName"
              value={form.driverName}
              onChange={onChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="최초등록일자"
              type="date"
              name="firstRegistrationDate"
              value={form.firstRegistrationDate}
              onChange={onChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="차종"
              name="vehicleType"
              value={form.vehicleType}
              onChange={onChange}
              fullWidth
            >
              {TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="최대 적재량(kg)"
              name="loadCapacityKg"
              value={form.loadCapacityKg}
              onChange={onChange}
              fullWidth
              placeholder="예) 2,000"
              inputMode="numeric"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="차량상태"
              name="status"
              value={form.status}
              onChange={onChange}
              fullWidth
            >
              {STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="현재 주행거리(km)"
              name="currentDistanceKm"
              value={form.currentDistanceKm}
              onChange={onChange}
              fullWidth
              placeholder="예) 35,090"
              inputMode="numeric"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="보험유무"
              name="insurance"
              value={form.insurance}
              onChange={onChange}
              fullWidth
            >
              <MenuItem value="유">유</MenuItem>
              <MenuItem value="무">무</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="마지막 점검일"
              type="date"
              name="lastInspectionDate"
              value={form.lastInspectionDate}
              onChange={onChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="다음 정비 예정일"
              type="date"
              name="nextInspectionDate"
              value={form.nextInspectionDate}
              onChange={onChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button disabled={saving} onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: C.gold }}
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? "처리 중…" : isEdit ? "수정" : "등록"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
