import axios from "axios";

const API_URL = "/api/policy";

// 정책 조회
export const getPolicy = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 정책 수정
export const updatePolicy = async (content) => {
  const response = await axios.put(API_URL, { content });
  return response.data;
};
