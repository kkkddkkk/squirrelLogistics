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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const SNSReAuthModal = ({ open, onClose, loginType, onSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");

    // Google OAuth URL로 리다이렉트
    const googleAuthUrl = `${
      process.env.REACT_APP_API_URL || "http://localhost:8080"
    }/oauth/google?reauth=true`;
    window.location.href = googleAuthUrl;
  };

  const handleKakaoLogin = () => {
    setIsLoading(true);
    setError("");

    // Kakao OAuth URL로 리다이렉트
    const kakaoAuthUrl = `${
      process.env.REACT_APP_API_URL || "http://localhost:8080"
    }/oauth/kakao?reauth=true`;
    window.location.href = kakaoAuthUrl;
  };

  const handleCancel = () => {
    setError("");
    setIsLoading(false);
    onClose();
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

  const getLoginTypeIcon = () => {
    switch (loginType) {
      case "GOOGLE":
        return "🔍";
      case "KAKAO":
        return "💬";
      default:
        return "🔐";
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Typography variant="h5" fontWeight="bold" color="#113F67">
          {getLoginTypeIcon()} {getLoginTypeText()} 재인증
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            정보 수정을 위해 {getLoginTypeText()} 계정으로 다시 로그인해주세요.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            보안을 위해 재인증이 필요합니다.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            minWidth: 100,
            borderColor: "#113F67",
            color: "#113F67",
            "&:hover": {
              borderColor: "#34699A",
              bgcolor: "#f5f5f5",
            },
          }}
        >
          취소
        </Button>

        <Button
          onClick={
            loginType === "GOOGLE" ? handleGoogleLogin : handleKakaoLogin
          }
          variant="contained"
          disabled={isLoading}
          sx={{
            minWidth: 100,
            bgcolor: "#113F67",
            "&:hover": {
              bgcolor: "#34699A",
            },
          }}
        >
          {isLoading ? "인증 중..." : `${getLoginTypeText()} 로그인`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SNSReAuthModal;
