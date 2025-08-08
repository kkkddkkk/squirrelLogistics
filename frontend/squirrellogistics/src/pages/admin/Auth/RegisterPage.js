import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  adminRegister,
  googleRegister,
  sendEmailCode,
  verifyEmailCode,
  sendSmsCode,
  verifySmsCode
} from "../../../api/auth";
import {
  Container, Paper, Typography,
  TextField, Button, Box, Grid
} from "@mui/material";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode]     = useState("");

  const [emailSent, setEmailSent]         = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [smsSent, setSmsSent]             = useState(false);
  const [smsVerified, setSmsVerified]     = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 이메일 인증
  const handleSendEmail = async () => {
    await sendEmailCode(form.email);
    setEmailSent(true);
    alert("인증 코드가 이메일로 전송되었습니다.");
  };
  const handleVerifyEmail = async () => {
    await verifyEmailCode(form.email, emailCode);
    setEmailVerified(true);
    alert("이메일 인증 완료!");
  };

  // SMS 인증
  const handleSendSms = async () => {
    await sendSmsCode(form.phone);
    setSmsSent(true);
    alert("SMS 인증 코드가 전송되었습니다.");
  };
  const handleVerifySms = async () => {
    await verifySmsCode(form.phone, smsCode);
    setSmsVerified(true);
    alert("전화번호 인증 완료!");
  };

  // 회원가입
  const handleSubmit = async () => {
    if (!emailVerified)   return alert("이메일을 인증해주세요.");
    if (!smsVerified)     return alert("전화번호를 인증해주세요.");
    if (form.password !== form.confirmPassword)
      return alert("비밀번호가 일치하지 않습니다.");

    await adminRegister({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone
    });
    alert("회원가입 완료!");
    navigate("/admin/login");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          관리자 회원가입
        </Typography>

        <Box component="form" noValidate>
          <TextField
            label="이름"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />

          <Grid container spacing={1} alignItems="center">
            <Grid item xs={8}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                disabled={emailVerified}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={emailSent ? handleVerifyEmail : handleSendEmail}
                disabled={emailVerified || !form.email}
              >
                {emailSent ? "인증 확인" : "인증 요청"}
              </Button>
            </Grid>
          </Grid>
          {emailSent && !emailVerified && (
            <TextField
              label="이메일 코드 입력"
              fullWidth
              margin="normal"
              value={emailCode}
              onChange={e => setEmailCode(e.target.value)}
            />
          )}

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            label="Password 확인"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={8}>
              <TextField
                label="전화번호"
                name="phone"
                fullWidth
                value={form.phone}
                onChange={handleChange}
                disabled={smsVerified}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={smsSent ? handleVerifySms : handleSendSms}
                disabled={smsVerified || !form.phone}
              >
                {smsSent ? "인증 확인" : "인증 요청"}
              </Button>
            </Grid>
          </Grid>
          {smsSent && !smsVerified && (
            <TextField
              label="SMS 코드 입력"
              fullWidth
              margin="normal"
              value={smsCode}
              onChange={e => setSmsCode(e.target.value)}
            />
          )}

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            회원가입
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              이미 계정이 있으신가요?{" "}
              <Link to="/admin/login" style={{ textDecoration: "none" }}>
                로그인
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 1, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              또는
            </Typography>
            <GoogleLogin
              onSuccess={resp =>
                googleRegister(resp.credential)
                  .then(() => {
                    alert("구글 회원가입 완료");
                    navigate("/admin/login");
                  })
                  .catch(() => alert("구글 회원가입 실패"))
              }
              onError={() => alert("구글 회원가입 실패")}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
