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
    console.log("🔍 인터셉터에서 토큰 확인:", token ? "있음" : "없음");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔍 Authorization 헤더 설정:", `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log("⚠️ 토큰이 없어서 Authorization 헤더를 설정하지 않음");
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
    console.log("🔍 비밀번호 재설정 요청 - email:", email);
    const res = await axios.post(`${API_SERVER_HOST}/api/company/password/reset/request`, { email: email });
    console.log("🔍 비밀번호 재설정 응답:", res.data);
    return res.data; // 전체 응답 데이터 반환
  } catch (err) {
    console.error("❌ 비밀번호 재설정 링크 요청 실패:", err);
    if (err.response) {
      console.error("❌ 응답 상태:", err.response.status);
      console.error("❌ 응답 데이터:", err.response.data);
    }
    return { ok: false, message: "요청 중 오류가 발생했습니다." };
  }
};

// ✅ 0-2) 회원정보 수정 저장
export const updateCompanyProfile = async (payload) => {
  try {
    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error("❌ JWT 토큰이 없습니다");
      return { ok: false, message: "인증 토큰이 없습니다. 다시 로그인해주세요." };
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
    if (err.response) {
      console.error("❌ 응답 상태:", err.response.status);
      console.error("❌ 응답 데이터:", err.response.data);
      return err.response.data;
    }
    return { ok: false, message: "요청 중 오류가 발생했습니다." };
  }
};

// ✅ 1. 회원정보 불러오기 (기존)
export const getUserInfo = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/api/company/info`);
    return res.data;
  } catch (err) {
    console.error("❌ 회원정보 불러오기 실패:", err);
    return null;
  }
};

// ✅ 1-1. 마이페이지 회원정보 불러오기 (새로운 API)
export const getMyPageInfo = async () => {
  try {
    // localStorage에서 userId 가져오기 (권장)
    const userId = localStorage.getItem("userId");
    console.log("🔍 현재 저장된 userId:", userId);
    
    if (!userId) {
      console.error("❌ localStorage에 userId가 없습니다");
      return null;
    }
    
    // 디버깅: localStorage의 모든 값 확인
    console.log("🔍 localStorage 전체 내용:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }
    
    // userId를 쿼리 파라미터로 전달
    const res = await axios.get(`${API_SERVER_HOST}/api/company/mypage?userId=${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error("❌ 마이페이지 정보 불러오기 실패:", err);
    console.error("❌ 에러 상세:", err.response?.data);
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
