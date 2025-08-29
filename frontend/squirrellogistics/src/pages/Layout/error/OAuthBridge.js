import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuthBridge() {
    const { search, pathname } = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        const q = new URLSearchParams(search);
        if (pathname.endsWith("/success")) {
            const token = q.get("token");
            const name = q.get("name");
            const role = q.get("role");

            if (token) {
                localStorage.setItem("accessToken", token);
                if (name) localStorage.setItem("userName", name);
                if (role) localStorage.setItem("userRole", role);
            }
            // 홈으로 이동
            nav("/", { replace: true });
            // 여기서 전역 상태를 사용해 로그인 모달 닫기 등 필요한 UI 업데이트도 가능
            return;
        }

        if (pathname.endsWith("/failure")) {
            const reason = q.get("reason") || "unknown";
            const msgMap = {
                withdrawn: "탈퇴 처리된 계정입니다.",
                kakao_error: "카카오 인증 처리 중 오류가 발생했습니다.",
                unknown: "소셜 로그인에 실패했습니다.",
            };
            alert(msgMap[reason] || msgMap.unknown);

            // 홈으로 보내고 로그인 모달 다시 열기 원하는 경우:
            nav("/", { replace: true });
            // ex) 전역 store/Context로 로그인 모달 열기 신호 발행
        }
    }, [search, pathname, nav]);

    return null; // 전환만 담당
}