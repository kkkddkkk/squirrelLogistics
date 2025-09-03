import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  Box,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Alert,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // 카카오 대체 아이콘
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/user/api";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../../components/common/squirrelLogisticsLogo.png"
import darkLogo from "../../components/common/squirrelLogisticsLogo_dark.png"

export default function LoginModal({ open, onClose, onLoggedIn }) {
  const navigate = useNavigate();

  const thisTheme = useTheme();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ loginId: "", password: "" });

  // ✅ 신규: 역할 선택
  const [role, setRole] = useState(""); // "DRIVER" | "COMPANY"
  const [roleError, setRoleError] = useState("");

  const REST_KEY =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_KAKAO_REST_KEY) ||
    process.env.REACT_APP_KAKAO_REST_KEY ||
    "";

  const REDIRECT_URI =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_KAKAO_REDIRECT_URI) ||
    process.env.REACT_APP_KAKAO_REDIRECT_URI ||
    "http://localhost:8080/oauth/kakao/callback";

  const handleKakaoLogin = () => {
    if (!role) {
      setRoleError("역할을 먼저 선택해 주세요.");
      return;
    }

    // 백업: 콜백에서 읽을 수 있게 저장
    sessionStorage.setItem("socialRole", role);

    // Kakao는 state로 role 전달
    const state = encodeURIComponent(role);
    const url =
      "https://kauth.kakao.com/oauth/authorize" +
      `?response_type=code&client_id=${encodeURIComponent(REST_KEY)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${state}`;

    window.location.href = url;
  };

  // 저장된 아이디/초기화
  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem("savedLoginId");
    if (saved) {
      setLoginId(saved);
      setRememberId(true);
    }
    setPassword("");
    setErrors({ loginId: "", password: "" });
    setRoleError("");
  }, [open]);

  const validate = () => {
    const next = {};
    if (!loginId.trim()) next.loginId = "아이디를 입력해주세요.";
    if (!password) next.password = "비밀번호를 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/login", { loginId, password });
      if (String(data?.role).toUpperCase() === "ETC") {
        setErrors({ loginId: "", password: "탈퇴 처리된 계정입니다. 고객센터로 문의해 주세요." });
        return; // 토큰 저장/진행 중단
      }

      // 서버 응답 예: { accessToken, name, role }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("userRole", data.role || "");
      if (rememberId) localStorage.setItem("savedLoginId", loginId);
      else localStorage.removeItem("savedLoginId");

      onLoggedIn?.(data);
      onClose();
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401
          ? "아이디 또는 비밀번호를 확인해 주세요."
          : err?.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      setErrors({ loginId: "", password: msg });
    } finally {
      setLoading(false);
    }
  };

  const snsDisabled = !role; // 역할 선택 전 SNS 비활성화

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ width: 420, p: 4, position: "relative" }}>
        {/* 닫기 */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon sx={{color: thisTheme.palette.text.primary}}/>
        </IconButton>

        {/* 로고/인사 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src={thisTheme.palette.mode==="light"?logo:darkLogo}
            alt="logo"
            style={{ width: 80, marginBottom: 8 }}
          />
          <Typography variant="h6" fontWeight={700}>
            환영합니다
          </Typography>
          <Typography variant="body2">
            다람로지틱스에서 손쉽게 물류 중개 서비스를 이용하실 수 있습니다.
          </Typography>
        </Box>

        {/* ✅ 역할 선택 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            먼저 역할을 선택해 주세요
          </Typography>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, v) => {
              setRole(v || "");
              setRoleError("");
            }}
            fullWidth
          >
            <ToggleButton value="DRIVER" sx={{
              color: thisTheme.palette.text.secondary,
              "&.Mui-selected": {
                backgroundColor: thisTheme.palette.primary.main,
                color: thisTheme.palette.text.primary,
                "&:hover": {
                  backgroundColor: thisTheme.palette.primary.dark,
                }
              }
            }}>배송기사</ToggleButton>
            <ToggleButton value="COMPANY" sx={{
              color: thisTheme.palette.text.secondary,
              "&.Mui-selected": {
                backgroundColor: thisTheme.palette.primary.main,
                color: thisTheme.palette.text.primary,
                "&:hover": {
                  backgroundColor: thisTheme.palette.primary.dark,
                }
              }
            }}>기업고객</ToggleButton>
          </ToggleButtonGroup>
          {roleError && (
            <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
              {roleError}
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 일반 로그인 폼 */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="아이디"
            margin="dense"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              if (errors.loginId) setErrors((p) => ({ ...p, loginId: "" }));
            }}
            error={!!errors.loginId}
            helperText={errors.loginId || " "}
            autoFocus
          />
          <TextField
            fullWidth
            label="비밀번호"
            type={showPassword ? "text" : "password"}
            margin="dense"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            error={!!errors.password}
            helperText={errors.password || " "}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    sx={{color: thisTheme.palette.text.primary}}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberId}
                onChange={(e) => setRememberId(e.target.checked)}
              />
            }
            label="아이디 저장"
            sx={{ mt: 0.5 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 1.5 }}
            disabled={loading}
          >
            {loading ? "처리 중..." : "시작하기"}
          </Button>
        </Box>

        {/* SNS 로그인 */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          또는 SNS로 계속하기
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {/* Google */}
          <Box
            sx={{
              flex: 1,
              opacity: snsDisabled ? 0.5 : 1,
              pointerEvents: snsDisabled ? "none" : "auto",
            }}
          >
            <GoogleLogin
              onSuccess={async (cred) => {
                try {
                  const idToken = cred.credential;
                  // 역할 함께 전송
                  const { data } = await api.post("/api/auth/oauth/google", {
                    idToken,
                    role, // "DRIVER" | "COMPANY"
                  });
                  console.log(data)
                  if (String(data?.role).toUpperCase() === "ETC") {
                    alert("탈퇴 처리된 계정입니다. 고객센터로 문의해 주세요.");
                    return; // 토큰 저장/진행 중단
                  }

                  localStorage.setItem("accessToken", data.accessToken);
                  if (data.name) localStorage.setItem("userName", data.name);
                  if (data.role) localStorage.setItem("userRole", data.role);

                  onLoggedIn?.(data);
                  onClose();
                } catch (e) {
                  console.error(e);
                  alert("탈퇴된 계정입니다.");
                }
              }}
              onError={() => alert("구글 로그인에 실패했습니다.")}
              useOneTap={false} // 역할 선택 흐름을 위해 자동 원탭 비활성 권장
            />
          </Box>

          {/* Kakao */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<ChatBubbleIcon />}
            sx={{ backgroundColor: "#fee500", color: "#000", flex: 1 }}
            onClick={handleKakaoLogin}
            disabled={snsDisabled}
          >
            카카오 로그인
          </Button>
        </Box>

        {/* 하단 링크 */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <Button
            onClick={() => {
              onClose();
              navigate("/register");
            }}
          >
            회원가입
          </Button>
          <Button
            variant="text"
            onClick={() => alert("비밀번호 찾기는 추후 지원 예정입니다.")}
          >
            비밀번호 찾기
          </Button>
        </Box>
      </DialogContent>
    </Dialog >
  );
}
