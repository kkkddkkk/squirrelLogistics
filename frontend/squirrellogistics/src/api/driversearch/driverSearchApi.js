// src/api/driversearch/driverSearchApi.js
import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";
const BASE_URL = `${API_SERVER_HOST}/search-drivers`;

/**
 * 🔍 기사 검색 (필터 조건 포함, 페이징 지원)
 * 
 * @param {Object} searchParams - 검색 파라미터 (백엔드 DriverSearchRequestDTO와 동일한 구조)
 * @param {string} searchParams.keyword - 검색어
 * @param {boolean} searchParams.drivable - 즉시 배차 가능 여부
 * @param {number} searchParams.maxWeight - 최대 적재량 (kg)
 * @param {number} searchParams.vehicleTypeId - 차량 종류 ID
 * @param {string} searchParams.sortOption - 정렬 기준 (distance, rating)
 * @param {number} searchParams.latitude - 현재 위치 위도
 * @param {number} searchParams.longitude - 현재 위치 경도
 * @param {string} searchParams.region - 선호 지역
 * @param {number} searchParams.page - 페이지 번호 (0부터 시작)
 * @param {number} searchParams.size - 페이지 크기
 * @returns {Promise<Object>} 페이징된 응답 객체 (백엔드 DriverSearchPageResponseDTO와 동일한 구조)
 */
export const searchDrivers = async (searchParams) => {
  try {
    // 디버깅: 전송할 데이터 확인
    // console.log("API 호출 - searchParams:", searchParams);
    
    // 순환 참조 방지를 위해 JSON 변환 테스트
    let cleanParams;
    try {
      JSON.stringify(searchParams);
      cleanParams = searchParams;
      // console.log("API 호출 - searchParams JSON:", JSON.stringify(searchParams));
    } catch (e) {
      // console.error("API 호출 - 순환 참조 발견, 기본값 사용:", e);
      // 기본값으로 정리 (백엔드 DTO와 동일한 타입)
      cleanParams = {
        keyword: "",           // String
        drivable: false,       // Boolean
        maxWeight: null,       // Integer | null
        vehicleTypeId: null,   // Long | null
        sortOption: "",        // String
        latitude: null,        // Double | null
        longitude: null,       // Double | null
        region: "",            // String
        page: 0,              // Integer
        size: 5,             // Integer
      };
    }
    
    const response = await axios.post(`${BASE_URL}/search`, cleanParams);
    // console.log("API 응답 성공:", response.data);
    return response.data; // 페이징된 응답 객체 (DriverSearchPageResponseDTO)
  } catch (error) {
    // console.error("기사 검색 실패:", error);
    // console.error("에러 상세:", error.response?.data || error.message);
    
    // 에러 시 기본 응답 구조 반환 (백엔드 DTO와 동일한 구조)
    return {
      drivers: [],                    // List<DriverSearchResponseDTO>
      currentPage: 0,                 // int
      totalPages: 0,                  // int
      totalElements: 0,               // long
      pageSize: 10,                   // int
      hasNext: false,                 // boolean
      hasPrevious: false              // boolean
    };
  }
};

/**
 * 📏 거리 계산 (현재 위치와 기사 위치 비교)
 * Haversine 공식을 사용하여 두 지점 간의 거리 계산
 * 
 * @param {number} lat1 - 첫 번째 지점 위도
 * @param {number} lng1 - 첫 번째 지점 경도
 * @param {number} lat2 - 두 번째 지점 위도
 * @param {number} lng2 - 두 번째 지점 경도
 * @returns {number} 두 지점 간의 거리 (km)
 */
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

/**
 * 🚀 기사님에게 요청 보내기
 * 
 * @param {number} driverId - 기사 ID
 * @returns {Promise<Object>} 요청 결과
 */
export const sendDriverRequest = async (driverId) => {
  try {
    const response = await axios.post(`${API_SERVER_HOST}/company/drivers/${driverId}/request`);
    return response.data;
  } catch (error) {
    // console.error("기사 요청 실패:", error);
    return null;
  }
};

/**
 * 🧪 API 테스트
 * 
 * @returns {Promise<Object>} 테스트 결과
 */
export const testDriverSearchAPI = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/test`);
    return response.data;
  } catch (error) {
    // console.error("API 테스트 실패:", error);
    return null;
  }
};

/**
 * 📊 기사 통계 정보 조회
 * 
 * @returns {Promise<Object>} 기사 통계 정보
 */
export const getDriverStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    // console.error("기사 통계 조회 실패:", error);
    return null;
  }
};

/**
 * 🔄 기사 검색 히스토리 저장
 * 
 * @param {Object} searchParams - 검색 파라미터
 * @returns {Promise<Object>} 저장 결과
 */
export const saveSearchHistory = async (searchParams) => {
  try {
    const response = await axios.post(`${BASE_URL}/history`, searchParams);
    return response.data;
  } catch (error) {
    // console.error("검색 히스토리 저장 실패:", error);
    return null;
  }
};

/**
 * 📍 기사 위치 기반 검색
 * 
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @param {number} radius - 검색 반경 (km, 기본값: 50)
 * @returns {Promise<Object>} 위치 기반 검색 결과
 */
export const searchDriversByLocation = async (latitude, longitude, radius = 50) => {
  try {
    const response = await axios.post(`${BASE_URL}/location`, {
      latitude,
      longitude,
      radius
    });
    return response.data;
  } catch (error) {
    // console.error("위치 기반 기사 검색 실패:", error);
    return null;
  }
};
