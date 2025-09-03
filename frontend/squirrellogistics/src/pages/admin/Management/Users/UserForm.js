import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Stack, TextField, MenuItem, Button,
  Grid, Divider, Chip, Select, OutlinedInput, FormControl, InputLabel
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, fetchUserById, updateUser } from "../../../../api/users";
import { CommonTitle } from "../../../../components/common/CommonText";

const C = { blue: "#113F67", gold: "#E8A93F" };

const ROLES = [
  { label: "관리자", value: "ADMIN" },
  { label: "매니저", value: "MANAGER" },
  { label: "일반",   value: "USER" },
  { label: "기사",   value: "DRIVER" },      // ✅ 추가
];

const STATUSES = [
  { label: "활성",   value: "ACTIVE" },
  { label: "비활성", value: "DISABLED" },
];

const REGIONS = ["서울","경기","인천","부산","대전","대구","광주","울산"];

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // ✅ 모든 필드 한곳에서 관리
  const [form, setForm] = useState({
    // 공통
    userType: "DRIVER",          // DRIVER | COMPANY
    role: "USER",
    status: "ACTIVE",
    name: "",
    username: "",                // 아이디
    email: "",
    phone: "",
    // 신규 등록시에만 사용
    password: "",
    passwordConfirm: "",

    // 주소 (공통으로 사용)
    address: "",
    addressDetail: "",

    // ─ driver 전용
    birth: "",
    account: "",
    bizRegNo: "",                // 개인사업자일 수 있어 driver에도 노출
    vehicleType: "",
    vehicleNumber: "",
    driverLicenseNo: "",
    licenseValidUntil: "",
    preferredStart: "07:00",
    preferredEnd: "18:00",
    preferredRegions: [],

    // ─ company 전용
    companyName: "",
    mainAccount: "",
  });

  const load = async () => {
    if (!isEdit) return;
    try {
      const data = await fetchUserById(id);
      setForm(prev => ({
        ...prev,
        userType: data.userType || (data.role === "DRIVER" ? "DRIVER" : "COMPANY"),
        role: data.role || "USER",
        status: data.status || "ACTIVE",
        name: data.name || data.companyName || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        addressDetail: data.addressDetail || "",

        // driver
        birth: data.birth || "",
        account: data.account || "",
        bizRegNo: data.bizRegNo || "",
        vehicleType: data.vehicleType || "",
        vehicleNumber: data.vehicleNumber || "",
        driverLicenseNo: data.driverLicenseNo || "",
        licenseValidUntil: data.licenseValidUntil || "",
        preferredStart: data.preferredStart || "07:00",
        preferredEnd: data.preferredEnd || "18:00",
        preferredRegions: data.preferredRegions || [],

        // company
        companyName: data.companyName || "",
        mainAccount: data.mainAccount || "",
      }));
    } catch {
      // 목업(편집 진입 시)
      setForm(prev => ({
        ...prev,
        userType: "DRIVER",
        role: "MANAGER",
        status: "ACTIVE",
        name: "홍길동",
        username: "user01",
        email: "user@mail.com",
        phone: "010-1234-5678",
        address: "서울 강남구 역삼동",
        addressDetail: "테헤란로 123 10층",
        birth: "1989-02-19",
        account: "3333-1988-67613",
        bizRegNo: "123-222-2342",
        vehicleType: "윙바디",
        vehicleNumber: "24구 2839",
        driverLicenseNo: "11-987654",
        licenseValidUntil: "2027-12-31",
        preferredStart: "07:00",
        preferredEnd: "18:00",
        preferredRegions: ["서울","경기","인천"],
      }));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onChangeMulti = (name) => (e) =>
    setForm(prev => ({ ...prev, [name]: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value }));

  const validate = () => {
    if (!form.name || !form.email) return "이름/이메일은 필수입니다.";
    if (!isEdit && form.password !== form.passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    return null;
  };

  const onSubmit = async () => {
    const msg = validate();
    if (msg) return alert(msg);

    // ✅ payload 구성 (백엔드 스키마에 맞게 필요한 부분만 사용될 것)
    const payload = {
      userType: form.userType,
      role: form.role,
      status: form.status,
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      address: form.address,
      addressDetail: form.addressDetail,

      // driver
      birth: form.userType === "DRIVER" ? form.birth : undefined,
      account: form.userType === "DRIVER" ? form.account : undefined,
      bizRegNo: form.userType === "DRIVER" ? form.bizRegNo : (form.userType === "COMPANY" ? form.bizRegNo : undefined),
      vehicleType: form.userType === "DRIVER" ? form.vehicleType : undefined,
      vehicleNumber: form.userType === "DRIVER" ? form.vehicleNumber : undefined,
      driverLicenseNo: form.userType === "DRIVER" ? form.driverLicenseNo : undefined,
      licenseValidUntil: form.userType === "DRIVER" ? form.licenseValidUntil : undefined,
      preferredStart: form.userType === "DRIVER" ? form.preferredStart : undefined,
      preferredEnd: form.userType === "DRIVER" ? form.preferredEnd : undefined,
      preferredRegions: form.userType === "DRIVER" ? form.preferredRegions : undefined,

      // company
      companyName: form.userType === "COMPANY" ? form.companyName : undefined,
      mainAccount: form.userType === "COMPANY" ? form.mainAccount : undefined,

      // 신규 등록 시
      password: !isEdit ? form.password : undefined,
    };

    try {
      if (isEdit) {
        await updateUser(id, payload);
        alert("수정되었습니다.");
      } else {
        await createUser(payload);
        alert("등록되었습니다.");
      }
      navigate("/admin/management/users");
    } catch {
      alert(isEdit ? "수정 실패(목업)" : "등록 실패(목업)");
      navigate("/admin/management/users");
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: C.blue, fontWeight: 700, mb: 2 }}>
        사용자 {isEdit ? "수정" : "등록"}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {/* ───────── 기본 정보 ───────── */}
        <SectionTitle>기본 정보</SectionTitle>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} md={3}>
            <TextField
              select label="사용자 유형" name="userType" value={form.userType} onChange={onChange} fullWidth
              helperText="필드셋이 유형에 따라 바뀝니다"
            >
              <MenuItem value="DRIVER">배송기사</MenuItem>
              <MenuItem value="COMPANY">물류회사</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField select label="권한" name="role" value={form.role} onChange={onChange} fullWidth>
              {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField select label="상태" name="status" value={form.status} onChange={onChange} fullWidth>
              {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="이름" name="name" value={form.name} onChange={onChange} fullWidth required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="아이디" name="username" value={form.username} onChange={onChange} fullWidth />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="이메일" name="email" type="email" value={form.email} onChange={onChange} fullWidth required
              disabled={isEdit} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="연락처" name="phone" value={form.phone} onChange={onChange} fullWidth />
          </Grid>

          {!isEdit && (
            <>
              <Grid item xs={12} md={6}>
                <TextField label="비밀번호" name="password" type="password" value={form.password} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="비밀번호 확인" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={onChange} fullWidth />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={6}>
            <TextField label="주소" name="address" value={form.address} onChange={onChange} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="상세주소" name="addressDetail" value={form.addressDetail} onChange={onChange} fullWidth />
          </Grid>
        </Grid>

        {/* ───────── 유형별 섹션 ───────── */}
        {form.userType === "DRIVER" ? (
          <>
            <Divider sx={{ my: 3 }} />
            <CommonTitle>운전자 개인 정보</CommonTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="생년월일" name="birth" type="date" InputLabelProps={{ shrink: true }}
                           value={form.birth} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="계좌번호" name="account" value={form.account} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="사업자 등록 번호" name="bizRegNo" value={form.bizRegNo} onChange={onChange} fullWidth />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <SectionTitle>운송 차량 & 면허</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="차종" name="vehicleType" value={form.vehicleType} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="차량 번호" name="vehicleNumber" value={form.vehicleNumber} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="운전면허증 번호" name="driverLicenseNo" value={form.driverLicenseNo} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="면허 유효기간" name="licenseValidUntil" type="date" InputLabelProps={{ shrink: true }}
                           value={form.licenseValidUntil} onChange={onChange} fullWidth />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <SectionTitle>선호 정보</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="시작 시간" name="preferredStart" type="time"
                           value={form.preferredStart} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="종료 시간" name="preferredEnd" type="time"
                           value={form.preferredEnd} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="preferredRegions-label">운행 선호 지역</InputLabel>
                  <Select
                    labelId="preferredRegions-label"
                    multiple
                    value={form.preferredRegions}
                    onChange={onChangeMulti("preferredRegions")}
                    input={<OutlinedInput label="운행 선호 지역" />}
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        {selected.map((v) => <Chip key={v} size="small" label={v} />)}
                      </Stack>
                    )}
                  >
                    {REGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Divider sx={{ my: 3 }} />
            <SectionTitle>물류회사 정보</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="회사 이름" name="companyName" value={form.companyName} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="사업자 등록번호" name="bizRegNo" value={form.bizRegNo} onChange={onChange} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="메인 계좌" name="mainAccount" value={form.mainAccount} onChange={onChange} fullWidth />
              </Grid>
            </Grid>
          </>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={() => navigate(-1)}>취소</Button>
          <Button variant="contained" sx={{ bgcolor: C.gold }} onClick={onSubmit}>
            {isEdit ? "수정" : "등록"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

/* ─ helpers ─ */
function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
      {children}
    </Typography>
  );
}
