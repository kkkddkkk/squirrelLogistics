import axios from "axios";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:8080";
const BASE = `${API_ROOT}/api/public/faqs`;

// 응답 데이터 추출 헬퍼 함수
const extractData = (response) => {
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "요청 처리에 실패했습니다.");
};

// 에러 처리 헬퍼 함수
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

export const getFaqs = async (view = "") => {
  try {
    const params = view ? { view } : {};
    const response = await axios.get(BASE, { params });
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const getFaqById = async (id) => {
  try {
    const response = await axios.get(`${BASE}/${id}`);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const createFaq = async (data) => {
  try {
    console.log("FAQ 생성 요청 데이터:", data);
    console.log("API 엔드포인트:", BASE);
    
    const response = await axios.post(BASE, data, { 
      headers: { "Content-Type": "application/json" } 
    });
    
    console.log("FAQ 생성 API 응답:", response);
    return extractData(response);
  } catch (error) {
    console.error("createFaq API 에러:", error);
    handleError(error);
  }
};

export const updateFaq = async (id, data) => {
  try {
    const response = await axios.put(`${BASE}/${id}`, data, { 
      headers: { "Content-Type": "application/json" } 
    });
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const deleteFaq = async (id) => {
  try {
    const response = await axios.delete(`${BASE}/${id}`);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};
