import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  useTheme,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";

const SNSReAuthModal = ({ open, onClose, loginType, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const thisTheme = useTheme();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      // Google 재인증 API 호출
      const response = await fetch(
        "http://localhost:8080/api/auth/google/reverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        setError("Google 재인증에 실패했습니다.");
      }
    } catch (error) {
      console.error("Google 재인증 오류:", error);
      setError("Google 재인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoReAuth = () => {
    setIsLoading(true);
    setError("");

    // Kakao 재인증 URL 생성
    const REST_KEY = process.env.REACT_APP_KAKAO_REST_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;

    if (!REST_KEY) {
      setError("Kakao 설정이 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    const state = encodeURIComponent("REAUTH");
    const url =
      "https://kauth.kakao.com/oauth/authorize" +
      `?response_type=code&client_id=${encodeURIComponent(REST_KEY)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${state}`;

    // 팝업으로 Kakao 재인증 열기
    const popup = window.open(
      url,
      "kakaoReAuth",
      "width=480,height=640,menubar=no,toolbar=no,status=no"
    );

    // 팝업 닫힘 감시
    const watch = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(watch);
        setIsLoading(false);
      }
    }, 500);
  };

  const getLoginTypeText = () => {
    switch (loginType) {
      case "GOOGLE":
        return "Google";
      case "KAKAO":
        return "Kakao";
      default:
        return "SNS";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          textAlign: "center",
          color: thisTheme.palette.primary.main,
          fontWeight: "bold",
          position: "relative",
        }}
      >
        {getLoginTypeText()} 재인증
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: thisTheme.palette.primary.main,
            "&:hover": {
              bgcolor: "rgba(17, 63, 103, 0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
          회원정보 수정을 위해 {getLoginTypeText()} 계정으로 재인증해주세요.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          {loginType === "GOOGLE" && (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google 로그인에 실패했습니다.")}
              disabled={isLoading}
            />
          )}

          {loginType === "KAKAO" && (
            <Button
              variant="contained"
              onClick={handleKakaoReAuth}
              disabled={isLoading}
              startIcon={<ChatBubbleIcon />}
              sx={{
                bgcolor: "#FEE500",
                color: "#000000",
                "&:hover": {
                  bgcolor: "#FDD835",
                },
                "&:disabled": {
                  bgcolor: "#F5F5F5",
                  color: "#9E9E9E",
                },
              }}
            >
              {isLoading ? "인증 중..." : "Kakao 계정으로 재인증"}
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}></DialogActions>
    </Dialog>
  );
};

export default SNSReAuthModal;
