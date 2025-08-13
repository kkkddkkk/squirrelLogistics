import { useEffect } from "react";

/**
 * 소셜 재인증 성공 후 백엔드가 이 경로로 리다이렉트하도록 설정하세요.
 * 이 화면은 곧바로 부모 창에 성공 메시지를 보내고 스스로 닫힙니다.
 */
export default function SocialReauthComplete() {
  useEffect(() => {
    try {
      window.opener?.postMessage({ type: "SOCIAL_REAUTH_SUCCESS" }, window.location.origin);
    } catch (e) {
      // 메시지 전송 실패 시 에러로 통지
      window.opener?.postMessage({ type: "SOCIAL_REAUTH_ERROR" }, "*");
    } finally {
      window.close();
    }
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      인증을 완료했습니다. 창을 닫아주세요.
    </div>
  );
}
