import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { verifyPassword } from "../../api/driver/driverApi";

const VerificationPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 비밀번호 확인
  const handlePasswordConfirm = async () => {
    if (!password || password.trim() === "") {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 백엔드 API를 통해 비밀번호 확인
      const isValid = await verifyPassword(password);

      if (isValid) {
        setSuccess("인증이 완료되었습니다.");
        setTimeout(() => {
          navigate("/driver/editprofile", {
            state: {
              verifiedPassword: password,
            },
          });
        }, 1000);
      } else {
        setError("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      }
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      console.error("에러 상세:", error.response?.data);
      setError("비밀번호 확인에 실패했습니다. 다시 입력해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePasswordConfirm();
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "white",
          }}
        >
          {/* 헤더 */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/driver/profile")}
              sx={{ position: "absolute", left: 16, top: 16 }}
            >
              뒤로가기
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 40, color: "#113F67", mr: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="#113F67">
                비밀번호 확인
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary">
              회원정보 수정을 위해 비밀번호를 입력해주세요.
            </Typography>
          </Box>

          {/* 비밀번호 입력 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="password"
              label="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              error={!!error}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Box>

          {/* 버튼 */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/driver/profile")}
              disabled={isLoading}
              sx={{
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
              fullWidth
              variant="contained"
              onClick={handlePasswordConfirm}
              disabled={isLoading}
              sx={{
                bgcolor: "#113F67",
                "&:hover": {
                  bgcolor: "#34699A",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "확인"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerificationPage;
