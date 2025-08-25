// src/api/company/companyApi.js
import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080";

// axios 인스턴스 생성
const companyApi = axios.create({
  baseURL: `${API_SERVER_HOST}/api/company`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 추가
companyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Company 정보 조회 (userId로)
export const getCompanyByUserId = async (userId) => {
  try {
    const response = await companyApi.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Company 정보 조회 실패:", error);
    throw error;
  }
};

// Company 정보 조회 (companyId로)
export const getCompanyById = async (companyId) => {
  try {
    const response = await companyApi.get(`/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Company 정보 조회 실패:", error);
    throw error;
  }
};

export default companyApi;

// ✅ 0) 아이디/비밀번호로 본인인증
export const verifyCredentials = async ({ loginId, password }) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/api/company/verify`, { loginId, password });
    return !!res.data?.ok;
  } catch (err) {
    console.error("❌ 본인인증 실패:", err);
    return false;
  }
};

/* ✅ 0-1) 비밀번호 재설정 링크(단발성 토큰) 요청 */
export const requestPasswordReset = async (email) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/api/company/password/reset/request`, { email });
    return !!res.data?.ok;
  } catch (err) {
    console.error("❌ 비밀번호 재설정 링크 요청 실패:", err);
    return false;
  }
};

// ✅ 0-2) 회원정보 수정 저장
export const updateCompanyProfile = async (payload) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/api/company/profile`, payload);
    return res.data;
  } catch (err) {
    console.error("❌ 회원정보 수정 실패:", err);
    throw err;
  }
};

// ✅ 1. 회원정보 불러오기
export const getUserInfo = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/api/company/info`);
    return res.data;
  } catch (err) {
    console.error("❌ 회원정보 불러오기 실패:", err);
    return null;
  }
};

// ✅ 2. 배송리스트 불러오기
export const getDeliveryList = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/api/company/deliveries`);
    return res.data;
  } catch (err) {
    console.error("❌ 배송 정보 불러오기 실패:", err);
    return [];
  }
};
