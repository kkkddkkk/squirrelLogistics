import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompanyVerifyPage.css";
import { verifyCredentials, requestPasswordReset } from "../../api/company/companyApi";
import { useSelector } from "react-redux";

// 백엔드에서 소셜 재인증 시작(팝업 리다이렉트)용 엔드포인트
const SOCIAL_REAUTH_START = "/api/company/auth/social/reauth/start";

const CompanyVerifyPage = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.company.userInfo); // { email, loginProvider: 'local'|'google'|'kakao' }

  // 로컬 인증용
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // 비밀번호 재설정(토큰 메일)용
  const [email, setEmail] = useState(userInfo?.email || "");
  const [resetLoading, setResetLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 공통
  const [err, setErr] = useState("");

  // 소셜 재인증용
  const [socialLoading, setSocialLoading] = useState(false);
  const popupRef = useRef(null);

  const isSocialUser = !!(userInfo?.loginProvider && userInfo.loginProvider !== "local");

  /* ===== 로컬 사용자 인증 ===== */
  const handleVerify = async () => {
    setErr("");
    if (!loginId || !password) {
      setErr("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    const ok = await verifyCredentials({ loginId, password });
    if (!ok) {
      setErr("아이디 혹은 비밀번호가 올바르지 않습니다.");
      return;
    }
    sessionStorage.setItem("company_edit_verified", "true");
    navigate("/company/edit");
  };

  /* ===== 비밀번호 재설정(토큰 메일 전송) ===== */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleRequestReset = async () => {
    setErr("");
    if (cooldown > 0) return;

    const targetEmail = email?.trim();
    const emailOk = /^\S+@\S+\.\S+$/.test(targetEmail || "");
    if (!emailOk) {
      setErr("유효한 이메일 주소를 입력해 주세요.");
      return;
    }
    setResetLoading(true);
    try {
      const ok = await requestPasswordReset(targetEmail);
      if (ok) {
        alert("재설정 링크가 이메일로 전송되었습니다. (유효시간 내에 진행해 주세요)");
        setCooldown(60);
      } else {
        setErr("이메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  /* ===== 소셜 재인증(팝업) ===== */
  const startSocialReauth = (provider) => {
    setErr("");
    setSocialLoading(true);

    // 팝업 내 최종 콜백(동일 오리진)
    const redirect = `${window.location.origin}/auth/social-complete`;
    const url = `${SOCIAL_REAUTH_START}?provider=${encodeURIComponent(
      provider
    )}&redirect=${encodeURIComponent(redirect)}`;

    // 팝업 오픈
    popupRef.current = window.open(
      url,
      "socialReauth",
      "width=480,height=640,menubar=no,toolbar=no,status=no"
    );

    // 팝업 닫힘 감시 (실패/취소 대비)
    const watch = setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        clearInterval(watch);
        setSocialLoading(false);
      }
    }, 500);
  };

  // 팝업 → 부모창으로 성공/실패 메시지 받기
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "SOCIAL_REAUTH_SUCCESS") {
        setSocialLoading(false);
        sessionStorage.setItem("company_edit_verified", "true");
        navigate("/company/edit");
      }
      if (e.data?.type === "SOCIAL_REAUTH_ERROR") {
        setSocialLoading(false);
        setErr("소셜 재인증에 실패했습니다. 다시 시도해 주세요.");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [navigate]);

  const goBack = () => navigate("/company");
  const onEnter = (e) => e.key === "Enter" && handleVerify();

  return (
    <div className="verify-wrap">
      <h2 className="verify-title">회원정보 수정</h2>

      <div className="verify-card">
        <h3 className="section-title">회원정보 확인</h3>

        {/* 로컬 사용자 인증 */}
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

        <label className="field">
          <span>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
          />
        </label>

        <div className="row-between">
          <button
            className="ghost-btn"
            onClick={handleRequestReset}
            disabled={resetLoading || cooldown > 0}
            title={cooldown > 0 ? `${cooldown}초 후 재전송 가능` : "비밀번호 재설정 링크 전송"}
          >
            {cooldown > 0 ? `비밀번호 찾기 (${cooldown}s)` : "비밀번호 찾기"}
          </button>
        </div>

        {/* 에러 */}
        {err && <div className="error-text" aria-live="assertive">{err}</div>}

        {/* 🔽 소셜 사용자용 재인증 버튼 (항상 표시) */}
        <div className="social-box" style={{ marginTop: 14 }}>
          <p>소셜 계정으로 인증하시겠어요?</p>
          <div className="social-row">
            <button
              className="social-btn"
              onClick={() => startSocialReauth("google")}
              disabled={socialLoading}
            >
              {socialLoading ? "인증 중..." : "구글로 재인증"}
            </button>
            <button
              className="social-btn"
              onClick={() => startSocialReauth("kakao")}
              disabled={socialLoading}
            >
              {socialLoading ? "인증 중..." : "카카오로 재인증"}
            </button>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="action-row">
          <button className="secondary" onClick={goBack}>취소</button>
          <button className="primary" onClick={handleVerify}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerifyPage;
