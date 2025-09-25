import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";

const api = axios.create({
    // baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
    baseURL: process.env.REACT_APP_API_BASE_URL || API_SERVER_HOST,
    withCredentials: false, // 필요 시 true (쿠키 사용 등)
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;