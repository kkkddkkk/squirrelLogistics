import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import SecurityIcon from "@mui/icons-material/Security";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const VerificationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
    setSuccess("");
    setIsCodeSent(false);
  };

  // 휴대폰 번호 형식 검증
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone);
  };

  // 임시 인증번호 저장 (실제로는 서버에서 관리)
  const [tempVerificationCode, setTempVerificationCode] = useState("");

  // 인증번호 전송
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 임시 테스트용 인증번호 생성 (실제로는 서버에서 생성)
      const generatedCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      setTempVerificationCode(generatedCode);

      // 실제 API 연동 시에는 아래 주석을 해제하고 사용

      const response = await fetch("/api/verification/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, ""),
          type: "sms",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "인증번호 전송에 실패했습니다.");
      }

      // 테스트용: 인증번호를 alert로 표시 (실제로는 SMS로 전송)
      alert(`테스트용 인증번호: ${generatedCode}`);

      setIsCodeSent(true);
      setSuccess("인증번호가 전송되었습니다. (테스트용: alert 확인)");
    } catch (error) {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, ""),
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("본인인증이 완료되었습니다.");
        // 인증 성공 시 세션/로컬 스토리지에 인증 상태 저장
        localStorage.setItem("verificationStatus", "verified");
        localStorage.setItem("verifiedPhone", phoneNumber);

        // 2초 후 EditProfile 페이지로 이동
        setTimeout(() => {
          navigate("/driver/editprofile");
        }, 2000);
      } else {
        setError(data.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 간편인증 (카카오)
  const handleKakaoVerification = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 카카오 로그인 팝업 열기
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${
        process.env.REACT_APP_KAKAO_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        window.location.origin + "/api/auth/kakao/callback"
      )}&response_type=code`;

      window.open(kakaoAuthUrl, "kakaoAuth", "width=500,height=600");

      // 팝업에서 인증 완료 후 처리
      window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "KAKAO_AUTH_SUCCESS") {
          setSuccess("카카오 본인인증이 완료되었습니다.");
          localStorage.setItem("verificationStatus", "verified");
          localStorage.setItem("verificationMethod", "kakao");

          setTimeout(() => {
            navigate("/driver/editprofile");
          }, 2000);
        }
      });
    } catch (error) {
      setError("카카오 인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">
        {/* 뒤로가기 버튼 */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/driver/profile")}
          sx={{ mb: 3, color: "#113F67" }}
        >
          뒤로가기
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            sx={{ mb: 4, color: "#113F67" }}
          >
            본인인증
          </Typography>

          <Typography
            variant="body1"
            textAlign="center"
            sx={{ mb: 4, color: "#666" }}
          >
            회원정보 수정을 위해 본인인증이 필요합니다.
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 4 }}
          >
            <Tab
              icon={<PhoneIcon />}
              label="휴대폰 인증"
              iconPosition="start"
            />
            <Tab
              icon={<SecurityIcon />}
              label="간편인증"
              iconPosition="start"
            />
          </Tabs>

          {activeTab === 0 && (
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  휴대폰 번호
                </Typography>
                <TextField
                  fullWidth
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isCodeSent}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={sendVerificationCode}
                  disabled={!phoneNumber || isLoading}
                  fullWidth
                  sx={{
                    bgcolor: "#113F67",
                    "&:hover": { bgcolor: "#0d2d4a" },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : "인증번호 전송"}
                </Button>
              </Box>

              {isCodeSent && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    인증번호
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="6자리 인증번호 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={verifyCode}
                    disabled={!verificationCode || isLoading}
                    fullWidth
                    sx={{
                      bgcolor: "#113F67",
                      "&:hover": { bgcolor: "#0d2d4a" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "인증번호 확인"
                    )}
                  </Button>
                </Box>
              )}
            </Stack>
          )}

          {activeTab === 1 && (
            <Stack spacing={3}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                textAlign="center"
              >
                간편인증 방법을 선택해주세요
              </Typography>

              <Button
                variant="outlined"
                size="large"
                onClick={handleKakaoVerification}
                disabled={isLoading}
                sx={{
                  borderColor: "#FEE500",
                  color: "#000",
                  "&:hover": {
                    borderColor: "#FEE500",
                    bgcolor: "#FEE500",
                  },
                  py: 2,
                }}
              >
                카카오 본인인증
              </Button>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerificationPage;
