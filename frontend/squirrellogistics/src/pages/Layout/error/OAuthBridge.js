import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuthBridge() {
    const { search, pathname } = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        const q = new URLSearchParams(search);
        const isPopup = !!window.opener; // 팝업 여부 확인

        if (pathname.endsWith("/success")) {
            const token = q.get("token");
            const name = q.get("name");
            const role = q.get("role");

            if (isPopup) {
                // 팝업이면 부모 창에 메시지 전달
                window.opener.postMessage(
                    {
                        type: "SOCIAL_REAUTH_SUCCESS",
                        data: { accessToken: token, name, role },
                    },
                    window.location.origin
                );
                window.close();
                return;
            }

            // 일반 로그인 흐름
            if (token) {
                localStorage.setItem("accessToken", token);
                if (name) localStorage.setItem("userName", name);
                if (role) localStorage.setItem("userRole", role);
            }
            nav("/", { replace: true });
            return;
        }

        // if (pathname.endsWith("/failure")) {
        //     const reason = q.get("reason") || "unknown";
        //     const msgMap = {
        //         withdrawn: "탈퇴 처리된 계정입니다.",
        //         kakao_error: "카카오 인증 처리 중 오류가 발생했습니다.",
        //         unknown: "소셜 로그인에 실패했습니다.",
        //     };

        //     if (isPopup) {
        //         window.opener.postMessage(
        //             { type: "SOCIAL_REAUTH_ERROR", error: reason },
        //             window.location.origin
        //         );
        //         window.close();
        //         return;
        //     }

        //     alert(msgMap[reason] || msgMap.unknown);
        //     nav("/", { replace: true });
        // }
    }, [search, pathname, nav]);

    return null;
}
