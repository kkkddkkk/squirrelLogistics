import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompanyVerifyPage.css";
import { verifyCredentials, requestPasswordReset } from "../../api/company/companyApi";
import { useSelector } from "react-redux";
import ReLoginModal from "../../components/company/ReLoginModal";

const CompanyVerifyPage = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.company.userInfo);

  // 로컬스토리지에서 사용자 정보 가져오기
  const loginType = localStorage.getItem('loginType');
  const userEmail = localStorage.getItem('userEmail');

  // 로컬 인증용
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // 비밀번호 재설정용
  const [email, setEmail] = useState(userEmail || userInfo?.email || "");
  const [resetLoading, setResetLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // 공통
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // 소셜 재인증용
  const [showReLoginModal, setShowReLoginModal] = useState(false);

  // Redux 상태에서 소셜 로그인 여부 확인 (sns_login 필드 사용)
  const snsLogin = useSelector((s) => s.company.snsLogin);
  // 로그인 타입에 따라 인증 방법 결정
  const isSocialUser = snsLogin || !!(loginType && (loginType === 'google' || loginType === 'kakao'));

  /* ===== 로컬 사용자 인증 ===== */
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setErr("");
    setSuccess("");

    console.log("본인인증 시도:", { 
      loginId: `'${loginId}'`, 
      password: `'${password}'`,
      loginIdLength: loginId?.length || 0,
      passwordLength: password?.length || 0
    });

    if (!loginId || !password) {
      setErr("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const ok = await verifyCredentials({ loginId, password });
      console.log("본인인증 결과:", ok);

      if (!ok) {
        setErr("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      setSuccess("본인인증이 완료되었습니다.");
      sessionStorage.setItem("company_edit_verified", "true");

      // 1.5초 후 수정 페이지로 이동
      setTimeout(() => {
        navigate("/company/edit");
      }, 1500);

    } catch (error) {
      console.error("본인인증 에러:", error);
      setErr("인증 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  /* ===== 비밀번호 재설정 ===== */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);
  


  const handleRequestReset = async () => {
    setErr("");
    setSuccess("");
    
    if (cooldown > 0) return;

    const targetEmail = email?.trim();
    console.log("🔍 비밀번호 재설정 시도 - 원본 이메일:", email);
    console.log("🔍 비밀번호 재설정 시도 - 정리된 이메일:", targetEmail);
    
    const emailOk = /^\S+@\S+\.\S+$/.test(targetEmail || "");
    console.log("🔍 이메일 유효성 검사 결과:", emailOk);
    
    if (!emailOk) {
      setErr("유효한 이메일 주소를 입력해 주세요.");
      return;
    }
    
    if (!email) {
        setErr("이메일 주소를 입력해주세요.");
        return;
    }

    try {
        setResetLoading(true);
        console.log("🔍 requestPasswordReset 함수 호출 - 전달할 이메일:", email);
        const response = await requestPasswordReset(email);
        console.log("🔍 requestPasswordReset 응답:", response);
        
        if (response && response.ok) {
            setSuccess("비밀번호 재설정이 준비되었습니다. 팝업 창에서 새 비밀번호를 입력하세요.");
            setCooldown(60); // 60초 쿨다운
            setShowPasswordReset(false); // 폼 숨기기
            
            // 팝업으로 비밀번호 재설정 페이지 열기
            const resetUrl = `${window.location.origin}${response.resetUrl}?token=${response.token}&email=${encodeURIComponent(response.email)}`;
            console.log("🔍 비밀번호 재설정 팝업 URL:", resetUrl);
            
            const popup = window.open(
                resetUrl,
                'passwordReset',
                'width=500,height=600,scrollbars=yes,resizable=yes,status=yes'
            );
            
            if (popup) {
                // 팝업이 차단되지 않았는지 확인
                setTimeout(() => {
                    if (popup.closed) {
                        setErr("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
                    }
                }, 1000);
            } else {
                setErr("팝업을 열 수 없습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
            }
        } else {
            setErr(response?.message || "비밀번호 재설정 요청에 실패했습니다.");
        }
    } catch (error) {
        console.error("🔍 비밀번호 재설정 에러:", error);
        setErr("비밀번호 재설정 요청 중 오류가 발생했습니다.");
    } finally {
        setResetLoading(false);
    }
  };



  const goBack = () => navigate("/company");
  const onEnter = (e) => e.key === "Enter" && handleVerify();

  return (
    <div className="verify-wrap">
      <h2 className="verify-title">회원정보 수정</h2>

      <div className="verify-card">
        <h3 className="section-title">본인인증</h3>
        <p className="verify-description">
          회원정보 수정을 위해 본인인증이 필요합니다.
        </p>

        {/* 인증 방법 표시 */}
        <div className="auth-method-info">
          {isSocialUser ? (
            <div className="method-item">
              <span className="method-icon">
                {loginType === 'google' ? '🔍' : '💬'}
              </span>
              <span>
                소셜 계정으로 재로그인하여 본인인증을 완료하세요.
              </span>
            </div>
          ) : (
            <div className="method-item">
              <span className="method-icon">🔐</span>
              <span>로컬 계정으로 본인인증을 진행하세요.</span>
            </div>
          )}
        </div>

        {/* 로컬 사용자 인증 폼 */}
        {!isSocialUser && (
          <>
            <label className="field">
              <span>아이디</span>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onKeyDown={onEnter}
                placeholder="아이디를 입력하세요"
                autoFocus
              />
            </label>

            <label className="field">
              <span>비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onEnter}
                placeholder="비밀번호를 입력하세요"
              />
            </label>

            {/* 비밀번호 찾기 */}
            <div className="password-reset-section">
              <button 
                type="button" 
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="forgot-password-link"
              >
                비밀번호를 잊으셨나요?
              </button>
              
              {showPasswordReset && (
                <div className="reset-form">
                  <label className="field">
                    <span>이메일 주소</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@company.com"
                    />
                  </label>
                  
                  <button
                    className="ghost-btn reset-btn"
                    onClick={handleRequestReset}
                    disabled={resetLoading || cooldown > 0}
                    title={cooldown > 0 ? `${cooldown}초 후 재전송 가능` : "비밀번호 재설정 링크 전송"}
                  >
                    {cooldown > 0 ? `비밀번호 찾기 (${cooldown}s)` : "비밀번호 찾기"}
                  </button>
                </div>
              )}
            </div>

            {/* 로컬 인증 버튼 */}
            <div className="action-row">
              <button className="secondary" onClick={goBack}>취소</button>
              <button className="primary" onClick={handleVerify}>본인인증</button>
            </div>
          </>
        )}

        {/* 소셜 사용자용 재인증 버튼 */}
        {isSocialUser && (
          <div className="social-box">
            <div className="social-row">
              <button
                className="social-btn"
                onClick={() => setShowReLoginModal(true)}
              >
                소셜 재인증
              </button>
            </div>
            
            <div className="action-row">
              <button className="secondary" onClick={goBack}>취소</button>
            </div>
          </div>
        )}

        {/* 에러 및 성공 메시지 */}
        {err && <div className="error-text" aria-live="assertive">{err}</div>}
        {success && <div className="success-text" aria-live="assertive">{success}</div>}
      </div>

      {/* ReLoginModal */}
      <ReLoginModal
        open={showReLoginModal}
        onClose={() => setShowReLoginModal(false)}
        onSuccess={(userData) => {
          setSuccess("소셜 재인증이 완료되었습니다.");
          sessionStorage.setItem("company_edit_verified", "true");
          
          // 1.5초 후 수정 페이지로 이동
          setTimeout(() => {
            navigate("/company/edit");
          }, 1500);
        }}
        isSocialUser={true}
      />
    </div>
  );
};

export default CompanyVerifyPage;