import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
    withCredentials: false, // 필요 시 true (쿠키 사용 등)
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;