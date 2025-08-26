import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./api";

export default function useAuthSession({ onLogout, idleMinutes = 15 }) {
    const idleTimerRef = useRef(null);
    const expTimerRef = useRef(null);

    const clearTimers = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (expTimerRef.current) clearTimeout(expTimerRef.current);
    };

    // 1) JWT 만료 타이머
    const armExpTimer = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const { exp } = jwtDecode(token); // seconds
            const msLeft = exp * 1000 - Date.now();
            if (msLeft > 0) {
                expTimerRef.current = setTimeout(() => {
                    onLogout?.("세션이 만료되었습니다. 다시 로그인해 주세요.");
                }, msLeft);
            } else {
                onLogout?.("세션이 만료되었습니다. 다시 로그인해 주세요.");
            }
        } catch {
            // 토큰 파싱 실패시 즉시 로그아웃
            onLogout?.();
        }
    };

    // 2) 무활동(Idle) 타이머
    const armIdleTimer = () => {
        if (idleMinutes <= 0) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const idleMs = idleMinutes * 60 * 1000;

        const reset = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                onLogout?.("오랜 시간 활동이 없어 로그아웃되었습니다.");
            }, idleMs);
        };

        const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
        events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
        reset();

        // cleanup
        return () => events.forEach((ev) => window.removeEventListener(ev, reset));
    };

    useEffect(() => {
        clearTimers();
        const removeIdleListeners = armIdleTimer();
        armExpTimer();

        // 3) 서버가 401 주면 즉시 로그아웃 (axios 인터셉터)
        const resInterceptor = api.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err?.response?.status === 401) {
                    onLogout?.("세션이 만료되었거나 권한이 없습니다.");
                }
                return Promise.reject(err);
            }
        );

        return () => {
            clearTimers();
            removeIdleListeners?.();
            api.interceptors.response.eject(resInterceptor);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 토큰이 바뀌면(exp 달라짐) 타이머 다시 건다
    useEffect(() => {
        const handle = () => {
            clearTimers();
            armExpTimer();
        };
        window.addEventListener("storage", handle); // 다른 탭과도 동기화
        return () => window.removeEventListener("storage", handle);
    }, []);
}