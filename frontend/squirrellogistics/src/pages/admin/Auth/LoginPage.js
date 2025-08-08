import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  adminLogin,
  googleLogin
} from "../../../api/auth";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate                = useNavigate();

  const handleSubmit = async () => {
    try {
      const { data } = await adminLogin({ email, password });
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "로그인 실패");
    }
  };

  const handleGoogle = async resp => {
    try {
      const { data } = await googleLogin(resp.credential);
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch {
      alert("구글 로그인 실패");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          관리자 로그인
        </Typography>

        <Box component="form" noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            로그인
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <GoogleLogin onSuccess={handleGoogle} onError={() => alert("구글 로그인 에러")} />
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Link to="/admin/find-id" style={{ textDecoration: "none" }}>
            <Button size="small">아이디 찾기</Button>
          </Link>
          <Link to="/admin/password-reset" style={{ textDecoration: "none" }}>
            <Button size="small">비밀번호 찾기</Button>
          </Link>
        </Stack>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2">
            아직 계정이 없으신가요?{" "}
            <Link to="/admin/signup" style={{ textDecoration: "none" }}>
              회원가입
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
