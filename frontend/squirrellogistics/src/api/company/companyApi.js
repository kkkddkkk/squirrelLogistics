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
    console.log("🔍 비밀번호 재설정 요청 시작 - email:", email);
    const res = await axios.post(`${API_SERVER_HOST}/api/company/password/reset/request`, { email });
    console.log("🔍 비밀번호 재설정 응답:", res.data);
    return res.data;  // 전체 응답 객체 반환
  } catch (err) {
    console.error("❌ 비밀번호 재설정 링크 요청 실패:", err);
    if (err.response) {
      console.error("❌ 응답 상태:", err.response.status);
      console.error("❌ 응답 데이터:", err.response.data);
    }
    return null;  // 에러 시 null 반환
  }
};

// ✅ 0-2) 회원정보 수정 저장 (JWT 토큰 기반)
export const updateCompanyProfile = async (payload) => {
  try {
    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error("❌ JWT 토큰이 없습니다");
      throw new Error("인증 토큰이 없습니다");
    }
    
    // Authorization 헤더와 함께 요청 전송
    const res = await axios.put(`${API_SERVER_HOST}/api/company/profile`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
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

// ✅ 2. 배송리스트 불러오기 (JWT 토큰 기반)
export const getDeliveryList = async () => {
  try {
    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error("❌ JWT 토큰이 없습니다");
      return [];
    }
    
    // Authorization 헤더와 함께 요청 전송
    const res = await axios.get(`${API_SERVER_HOST}/api/company/deliveries`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    // deliveries 배열 반환
    return res.data.deliveries || [];
  } catch (err) {
    console.error("❌ 배송 정보 불러오기 실패:", err);
    return [];
  }
};

// ✅ 1-1. 마이페이지 회원정보 불러오기 (JWT 토큰 기반)
export const getMyPageInfo = async () => {
  try {
    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error("❌ JWT 토큰이 없습니다");
      return null;
    }
    
    // Authorization 헤더와 함께 요청 전송
    const res = await axios.get(`${API_SERVER_HOST}/api/company/mypage`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (err) {
    console.error("❌ 마이페이지 정보 불러오기 실패:", err);
    console.error("❌ 에러 상세:", err.response?.data);
    return null;
  }
};
