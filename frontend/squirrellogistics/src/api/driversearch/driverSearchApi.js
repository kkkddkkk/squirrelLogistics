// src/api/driversearch/driverSearchApi.js
import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080";
const BASE_URL = `${API_SERVER_HOST}/api/search-drivers`;

// 🔍 기사 검색 (필터 조건 포함)
export const searchDrivers = async (searchParams) => {
  try {
    const response = await axios.post(`${BASE_URL}/search`, searchParams);
    return response.data; // 기사 리스트 배열
  } catch (error) {
    console.error("기사 검색 실패:", error);
    return [];
  }
};

// 📏 거리 계산 (현재 위치와 기사 위치 비교)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371; // km
  return R * c;
};

// 🚀 기사님에게 요청 보내기
export const sendDriverRequest = async (driverId) => {
  try {
    const response = await axios.post(`${API_SERVER_HOST}/api/company/drivers/${driverId}/request`);
    return response.data;
  } catch (error) {
    console.error("기사 요청 실패:", error);
    return null;
  }
};

// 🧪 API 테스트
export const testDriverSearchAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    return response.data;
  } catch (error) {
    console.error("API 테스트 실패:", error);
    return null;
  }
};
