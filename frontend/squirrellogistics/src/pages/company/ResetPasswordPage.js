import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CompanyVerifyPage.css';
import './ResetPasswordPage.css';
import { Box, Grid } from '@mui/material';
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from '../../components/common/CommonText';
import CommonList from '../../components/common/CommonList';
import { ButtonContainer, TwoButtonsAtRight } from '../../components/common/CommonButton';
import { theme, applyThemeToCssVars } from '../../components/common/CommonTheme';

const ResetPasswordPage = () => {
  applyThemeToCssVars(theme);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('유효하지 않은 링크입니다.');
      return;
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검사
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:8080/api/company/password/reset/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setSuccess('비밀번호가 성공적으로 재설정되었습니다.');

        // 부모 창에 성공 메시지 전송
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'PASSWORD_RESET_SUCCESS',
            message: '비밀번호가 성공적으로 재설정되었습니다.'
          }, window.location.origin);
        }

        // 2초 후 팝업 자동 닫기
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setError(data.message || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      // console.error('비밀번호 재설정 오류:', error);
      setError('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate('/company/verify');

  if (!token || !email) {
    return (
      <div className="verify-wrap">
        <div className="verify-card">
          <h3 className="section-title">오류</h3>
          <p className="error-text">유효하지 않은 링크입니다.</p>
          <button className="secondary" onClick={goBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  const handleClickSubmit = (event) => {
    // form이 button 안에 있으면 currentTarget.form로 접근 가능
    event.currentTarget.form.requestSubmit();  // form 제출
  };

  return (
    <Grid container sx={{
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      py: { xs: 2, sm: 3, md: 4 }
    }}>
      <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }} sx={{ mx: 'auto', px: { xs: 2, sm: 3, md: 0 } }}>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} mb={{ xs: 3, sm: 4 }}>
          <CommonTitle sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem' } }}>
            비밀번호 재설정
          </CommonTitle>
        </Box>
        <CommonList padding={{ xs: 2, sm: 3, md: 5 }}>
          {/* <h3 className="section-title">새 비밀번호 설정</h3> */}
          <CommonSmallerTitle>새 비밀번호 설정</CommonSmallerTitle>
          <p className="verify-description">
            새로운 비밀번호를 입력해주세요.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <CommonSmallerTitle>새 비밀번호</CommonSmallerTitle>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (4자 이상)"
                minLength="4"
                required
                className='textInput'
              />
            </label>

            <label className="field">
              <CommonSmallerTitle>비밀번호 확인</CommonSmallerTitle>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                minLength="4"
                required
                className='textInput'
              />
            </label>

            <ButtonContainer marginTop={5}>
              <TwoButtonsAtRight
                leftTitle={"취소"}
                leftColor={theme.palette.text.secondary}
                leftClickEvent={goBack}

                rightTitle={loading ? '처리 중...' : '비밀번호 변경'}
                rightClickEvent={handleClickSubmit}

                gap={2}
              />
            </ButtonContainer>

          </form>

          {/* 에러 및 성공 메시지 */}
          {error && <div className="error-text" aria-live="assertive">{error}</div>}
          {success && <div className="success-text" aria-live="assertive">{success}</div>}
        </CommonList>
      </Grid>
    </Grid>
  );
};

export default ResetPasswordPage;
