// src/api/admin/http.js
import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";

export const adminHttp = axios.create({
    baseURL:
        process.env.NODE_ENV === "production"
            ? "/api/admin"                              // 배포 시엔 리버스프록시로 묶을 예정이면 상대경로 유지
            : `${API_SERVER_HOST}/api/admin`,        // 로컬 개발 시엔 백엔드 포트로 절대경로
            // : "http://localhost:8080/api/admin",        // 로컬 개발 시엔 백엔드 포트로 절대경로
    withCredentials: true,
});

adminHttp.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
