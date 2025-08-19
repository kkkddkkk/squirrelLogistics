import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get("token");
        const name = params.get("name"); 
        const role = params.get("role");

        if (token) {
            localStorage.setItem("accessToken", token);
            if (name) localStorage.setItem("userName", decodeURIComponent(name));
            if (role) localStorage.setItem("userRole", role);

            navigate("/", { replace: true });
        } else {
            navigate("/?oauth=failed", { replace: true });
        }
    }, [navigate, params]);

    return <div style={{ padding: 24 }}>카카오 로그인 처리 중...</div>;
}