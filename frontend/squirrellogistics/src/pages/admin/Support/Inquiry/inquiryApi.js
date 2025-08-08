import axios from "axios";

const API_URL = "/api/inquiries";

// 1:1 문의 전체 목록 조회
export const getInquiries = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 문의 상세 조회
export const getInquiryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// 답변 등록
export const submitAnswer = async (id, answer) => {
  const response = await axios.post(`${API_URL}/${id}/answer`, { answer });
  return response.data;
};
