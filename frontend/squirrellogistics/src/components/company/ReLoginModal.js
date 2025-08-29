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
  Divider,
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { googleOAuthReauth } from "../../api/company/companyApi";

const ReLoginModal = ({ open, onClose, onSuccess, isSocialUser = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const idToken = credentialResponse.credential;
      
      // 백엔드로 Google ID 토큰 전송하여 검증
      const response = await googleOAuthReauth(idToken);

      if (response.accessToken) {
        // 토큰 저장
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("userName", response.name);
        localStorage.setItem("userRole", response.role);
        
        setSuccess("Google 로그인이 완료되었습니다!");
        
        // 성공 후 edit 페이지로 이동
        setTimeout(() => {
          onSuccess?.(response.data);
          onClose();
          navigate("/company/edit");
        }, 1500);
      }
    } catch (error) {
      console.error("Google 로그인 오류:", error);
      setError("Google 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

    const handleKakaoLogin = () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Kakao OAuth URL 생성
      const REST_KEY = "454334ab163d2988fd117884949529f5"; // 실제 환경변수로 설정 권장
      const REDIRECT_URI = "http://localhost:8080/oauth/kakao/callback";
      const state = encodeURIComponent("COMPANY"); // 역할 정보 전달
      
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?` +
        `client_id=${REST_KEY}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `state=${state}&` +
        `provider=kakao`;

      // 팝업으로 Kakao OAuth 열기
      const popup = window.open(
        kakaoAuthUrl,
        "kakaoOAuth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (popup) {
        // 팝업이 차단되지 않았는지 확인
        setTimeout(() => {
          if (popup.closed) {
            setError("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
            setIsLoading(false);
          }
        }, 1000);

        // postMessage 이벤트 리스너 추가
        const handleMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data?.type === 'SOCIAL_REAUTH_SUCCESS') {
            setIsLoading(false);
            setSuccess("카카오 재인증이 완료되었습니다!");
            
            // 토큰 저장
            const { accessToken, name, role } = event.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("userName", name);
            localStorage.setItem("userRole", role);
            
            // 팝업 닫기
            popup.close();
            
            // 성공 후 edit 페이지로 이동
            setTimeout(() => {
              onSuccess?.({ accessToken, name, role });
              onClose();
              navigate("/company/edit");
            }, 1500);
            
            // 이벤트 리스너 제거
            window.removeEventListener('message', handleMessage);
          } else if (event.data?.type === 'SOCIAL_REAUTH_ERROR') {
            setIsLoading(false);
            setError(`카카오 재인증에 실패했습니다: ${event.data.error}`);
            
            // 팝업 닫기
            popup.close();
            
            // 이벤트 리스너 제거
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
        
        // 팝업 닫힘 감지
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            window.removeEventListener('message', handleMessage);
          }
        }, 1000);

        // 30초 후 타임아웃
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
            setError("로그인 시간이 초과되었습니다. 다시 시도해주세요.");
            setIsLoading(false);
            window.removeEventListener('message', handleMessage);
          }
        }, 30000);

      } else {
        setError("팝업을 열 수 없습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Kakao 로그인 오류:", error);
      setError("카카오 로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">다시 로그인</Typography>
          <IconButton onClick={onClose} disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isSocialUser 
            ? "회원정보 수정을 위해 소셜 재인증이 필요합니다."
            : "계정 정보를 수정하기 위해 다시 로그인이 필요합니다."
          }
        </Typography>

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

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Google로 로그인
          </Typography>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google 로그인에 실패했습니다.")}
            useOneTap={false}
            disabled={isLoading}
          />
        </Box>

        <Divider sx={{ my: 2 }}>또는</Divider>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            카카오로 로그인
          </Typography>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ChatBubbleIcon />}
            sx={{ 
              backgroundColor: "#fee500", 
              color: "#000",
              "&:hover": { backgroundColor: "#fdd835" }
            }}
            onClick={handleKakaoLogin}
            disabled={isLoading}
          >
            카카오 로그인
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReLoginModal;
