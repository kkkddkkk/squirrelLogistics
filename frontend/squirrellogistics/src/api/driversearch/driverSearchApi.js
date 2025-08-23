// src/api/driversearch/driverSearchApi.js
import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080";
const BASE_URL = `${API_SERVER_HOST}/api/search-drivers`;

// 🔍 기사 검색 (필터 조건 포함, 페이징 지원)
export const searchDrivers = async (searchParams) => {
  try {
    // 디버깅: 전송할 데이터 확인
    console.log("API 호출 - searchParams:", searchParams);
    
    // 순환 참조 방지를 위해 JSON 변환 테스트
    let cleanParams;
    try {
      JSON.stringify(searchParams);
      cleanParams = searchParams;
      console.log("API 호출 - searchParams JSON:", JSON.stringify(searchParams));
    } catch (e) {
      console.error("API 호출 - 순환 참조 발견, 기본값 사용:", e);
      // 기본값으로 정리
      cleanParams = {
        keyword: "",           // String
        drivable: false,       // Boolean
        maxWeight: null,       // Number | null
        vehicleTypeId: null,   // Number | null (Long 타입과 호환)
        sortOption: "",        // String
        latitude: null,        // Number | null
        longitude: null,       // Number | null
        region: "",            // String
        page: 0,              // Number
        size: 10,             // Number
      };
    }
    
    const response = await axios.post(`${BASE_URL}/search`, cleanParams);
    console.log("API 응답 성공:", response.data);
    return response.data; // 페이징된 응답 객체
  } catch (error) {
    console.error("기사 검색 실패:", error);
    console.error("에러 상세:", error.response?.data || error.message);
    return {
      drivers: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10,
      hasNext: false,
      hasPrevious: false
    };
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
