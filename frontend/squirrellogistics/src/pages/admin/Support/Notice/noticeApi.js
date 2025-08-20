import axios from "axios";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:8080";
const BASE = `${API_ROOT}/api/public/notices`;

// 응답 데이터 추출 헬퍼 함수
const extractData = (response) => {
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "요청 처리에 실패했습니다.");
};

// 에러 처리 헬퍼 함수
const handleError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error.message) {
    throw error;
  }
  throw new Error("알 수 없는 오류가 발생했습니다.");
};

export const getNotices = async (search = "") => {
  try {
    const params = search ? { search } : {};
    const response = await axios.get(BASE, { params });
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const getNoticeById = async (id) => {
  try {
    const response = await axios.get(`${BASE}/${id}`);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const createNotice = async (data) => {
  try {
    console.log("API 요청 데이터:", data);
    console.log("API 엔드포인트:", BASE);
    
    const response = await axios.post(BASE, data, { 
      headers: { "Content-Type": "application/json" } 
    });
    
    console.log("API 응답:", response);
    return extractData(response);
  } catch (error) {
    console.error("createNotice API 에러:", error);
    handleError(error);
  }
};

export const updateNotice = async (id, data) => {
  try {
    const response = await axios.put(`${BASE}/${id}`, data, { 
      headers: { "Content-Type": "application/json" } 
    });
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

export const deleteNotice = async (id) => {
  try {
    const response = await axios.delete(`${BASE}/${id}`);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};
