import axios from "axios";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:8080";
const BASE = `${API_ROOT}/api/public/policies`;

// 헬퍼 함수들
const extractData = (response) => {
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "알 수 없는 오류가 발생했습니다.");
};

const handleError = (error) => {
  console.error("API 에러 상세:", error);
  
  // 백엔드 서버 연결 실패
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    throw new Error("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
  }
  
  // 포트 연결 거부
  if (error.code === 'ERR_CONNECTION_REFUSED') {
    throw new Error("백엔드 서버(포트 8080)에 연결할 수 없습니다. 서버를 실행해주세요.");
  }
  
  // HTTP 에러 응답
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  
  // 기타 에러
  if (error.message) {
    throw error;
  }
  
  throw new Error("알 수 없는 오류가 발생했습니다.");
};

// 정책 목록 조회
export const getPolicies = async (search, type) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    
    const url = params.toString() ? `${BASE}?${params.toString()}` : BASE;
    console.log("정책 목록 조회 요청:", url);
    
    const response = await axios.get(url);
    const data = extractData(response);
    console.log("정책 목록 조회 응답:", data);
    
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 정책 상세 조회
export const getPolicyById = async (id) => {
  try {
    console.log("정책 상세 조회 요청 (ID):", id);
    
    const response = await axios.get(`${BASE}/${id}`);
    const data = extractData(response);
    console.log("정책 상세 조회 응답:", data);
    
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 정책 생성
export const createPolicy = async (policyData) => {
  try {
    console.log("정책 생성 요청:", policyData);
    
    const response = await axios.post(BASE, policyData);
    const data = extractData(response);
    console.log("정책 생성 응답:", data);
    
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 정책 수정
export const updatePolicy = async (id, policyData) => {
  try {
    console.log("정책 수정 요청 (ID):", id, policyData);
    
    const response = await axios.put(`${BASE}/${id}`, policyData);
    const data = extractData(response);
    console.log("정책 수정 응답:", data);
    
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 정책 삭제
export const deletePolicy = async (id) => {
  try {
    console.log("정책 삭제 요청 (ID):", id);
    
    const response = await axios.delete(`${BASE}/${id}`);
    const data = extractData(response);
    console.log("정책 삭제 응답:", data);
    
    return data;
  } catch (error) {
    handleError(error);
  }
};
