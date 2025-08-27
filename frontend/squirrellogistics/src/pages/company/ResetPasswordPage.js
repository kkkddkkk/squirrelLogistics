import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CompanyVerifyPage.css';

const ResetPasswordPage = () => {
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
      console.error('비밀번호 재설정 오류:', error);
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

  return (
    <div className="verify-wrap">
      <h2 className="verify-title">비밀번호 재설정</h2>

      <div className="verify-card">
        <h3 className="section-title">새 비밀번호 설정</h3>
        <p className="verify-description">
          새로운 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>새 비밀번호</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (4자 이상)"
              minLength="4"
              required
            />
          </label>

          <label className="field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              minLength="4"
              required
            />
          </label>

          <div className="action-row">
            <button type="button" className="secondary" onClick={goBack}>
              취소
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? '처리 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>

        {/* 에러 및 성공 메시지 */}
        {error && <div className="error-text" aria-live="assertive">{error}</div>}
        {success && <div className="success-text" aria-live="assertive">{success}</div>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
