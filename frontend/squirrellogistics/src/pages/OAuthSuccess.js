import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('처리 중...');

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const name = searchParams.get('name');
        const role = searchParams.get('role');
        const provider = searchParams.get('provider'); // google 또는 kakao

        if (!token || !name || !role) {
          setStatus('필수 정보가 누락되었습니다.');
          return;
        }

        // 부모 창이 있는지 확인 (팝업에서 열린 경우)
        if (window.opener && !window.opener.closed) {
          try {
            // 백엔드에 소셜 재인증 완료 알림
            const response = await api.post('/api/company/social/reauth/complete', {
              provider: provider || 'unknown',
              email: searchParams.get('email') || '',
              token: token
            });

            if (response.data.ok) {
              // 성공 시 부모 창에 메시지 전달
              window.opener.postMessage({
                type: 'SOCIAL_REAUTH_SUCCESS',
                data: {
                  accessToken: token,
                  name: name,
                  role: role,
                  provider: provider
                }
              }, window.location.origin);
              
              setStatus('재인증이 완료되었습니다. 창을 닫습니다...');
              
              // 1초 후 창 닫기
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              throw new Error(response.data.message || '재인증 처리에 실패했습니다.');
            }
          } catch (error) {
            console.error('소셜 재인증 완료 처리 오류:', error);
            
            // 에러 시 부모 창에 에러 메시지 전달
            window.opener.postMessage({
              type: 'SOCIAL_REAUTH_ERROR',
              error: error.message || '재인증 처리 중 오류가 발생했습니다.'
            }, window.location.origin);
            
            setStatus('재인증 처리 중 오류가 발생했습니다.');
            
            // 3초 후 창 닫기
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        } else {
          // 부모 창이 없는 경우 (직접 접근)
          setStatus('올바르지 않은 접근입니다.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth 성공 처리 오류:', error);
        setStatus('처리 중 오류가 발생했습니다.');
        
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'SOCIAL_REAUTH_ERROR',
            error: '처리 중 오류가 발생했습니다.'
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h2>소셜 재인증 처리</h2>
      <p>{status}</p>
      {status.includes('오류') && (
        <p style={{ color: 'red', fontSize: '14px' }}>
          잠시 후 자동으로 창이 닫힙니다.
        </p>
      )}
    </div>
  );
};

export default OAuthSuccess;
