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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GoogleIcon from "@mui/icons-material/Google";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // 카카오 대체용
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/user/api";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginModal({ open, onClose, onLoggedIn }) {
    const navigate = useNavigate();

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ loginId: "", password: "" });

    const REST_KEY =
        (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_KAKAO_REST_KEY) ||
        process.env.REACT_APP_KAKAO_REST_KEY || "";

    const REDIRECT_URI =
        (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_KAKAO_REDIRECT_URI) ||
        process.env.REACT_APP_KAKAO_REDIRECT_URI ||
        "http://localhost:8080/oauth/kakao/callback";

    const handleKakaoLogin = () => {
        if (REST_KEY) {
            const url =
                "https://kauth.kakao.com/oauth/authorize" +
                `?response_type=code&client_id=${encodeURIComponent(REST_KEY)}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
            window.location.href = url;
        } else {
            window.location.href = "http://localhost:8080/oauth/kakao/login";
        }
    };

    // 저장된 아이디 불러오기
    useEffect(() => {
        if (!open) return;
        const saved = localStorage.getItem("savedLoginId");
        if (saved) {
            setLoginId(saved);
            setRememberId(true);
        }
        setPassword("");
        setErrors({ loginId: "", password: "" });
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
            // 서버 응답 예시: { accessToken, tokenType: "Bearer", userId, name, role }
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("userRole", data.role || "");
            if (rememberId) localStorage.setItem("savedLoginId", loginId);
            else localStorage.removeItem("savedLoginId");

            onLoggedIn?.(data);
            onClose();
        } catch (err) {
            const status = err?.response?.status;
            const msg = status === 401
                ? "아이디 또는 비밀번호를 확인해 주세요."
                : (err?.response?.data?.message || "로그인 중 오류가 발생했습니다.");
            setErrors({ loginId: "", password: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ width: 400, p: 4, position: "relative" }}>
                {/* 닫기 버튼 */}
                <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>

                {/* 로고 + 인사말 */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img src="/images/logo.png" alt="logo" style={{ width: 80, marginBottom: 8 }} />
                    <Typography variant="h6" fontWeight="bold">
                        환영합니다
                    </Typography>
                    <Typography variant="body2">
                        다람로지틱스에서는 손쉽게
                        <br />
                        물류 중개 서비스를 이용하실 수 있습니다
                    </Typography>
                </Box>

                {/* 로그인 폼 */}
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
                                    <IconButton onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={rememberId} onChange={(e) => setRememberId(e.target.checked)} />}
                        label="아이디 저장"
                        sx={{ mt: 0.5 }}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ backgroundColor: "#007aff", mt: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? "처리 중..." : "시작하기"}
                    </Button>
                </Box>

                {/* 소셜 로그인 (placeholder) */}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <GoogleLogin
                        onSuccess={async (cred) => {
                            try {
                                const idToken = cred.credential; // ← 구글 ID 토큰
                                const { data } = await api.post("/api/auth/oauth/google", { idToken });

                                // 우리 서버가 반환한 액세스 토큰/유저정보 저장 (기존 로컬 로그인과 동일한 포맷)
                                localStorage.setItem("accessToken", data.accessToken);
                                if (data.name) localStorage.setItem("userName", data.name);
                                if (data.role) localStorage.setItem("userRole", data.role);

                                onLoggedIn?.(data);
                                onClose();
                            } catch (e) {
                                console.error(e);
                                alert("구글 로그인 처리 중 문제가 발생했습니다.");
                            }
                        }}
                        onError={() => alert("구글 로그인에 실패했습니다.")}
                        useOneTap // 원탭 사용(선택)
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ChatBubbleIcon />}
                        sx={{ backgroundColor: "#fee500", color: "#000" }}
                        onClick={handleKakaoLogin}
                    >
                        카카오 로그인
                    </Button>
                </Box>

                {/* 하단 링크 */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <Button
                        onClick={() => {
                            onClose();
                            navigate("/register");
                        }}
                    >
                        회원가입
                    </Button>
                    <Button variant="text" onClick={() => alert("비밀번호 찾기는 추후 지원 예정입니다.")}>
                        비밀번호 찾기
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}