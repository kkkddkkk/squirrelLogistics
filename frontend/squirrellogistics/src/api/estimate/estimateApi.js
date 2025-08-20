import axios from "axios";

/* =========================
 * 기본 설정
 * ========================= */

// ✅ API 서버 주소 (.env가 있으면 우선 사용)
export const API_SERVER_HOST =
  process.env.REACT_APP_API_HOST || "http://localhost:8080";

// ✅ Kakao Developers REST API 키
const KAKAO_REST_API_KEY = "KakaoAK c0e48ee321373e897ad48c8bf2d72460";

// 공통 axios 인스턴스
const http = axios.create({
  baseURL: API_SERVER_HOST,
  headers: { "Content-Type": "application/json" },
});

// 🔐 로그인되어 있으면 토큰 자동 첨부
http.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

/* =========================
 * Kakao 주소 → 좌표
 * ========================= */

/** 📌 주소 → 좌표 변환 (lat, lng) */
export const getCoordsFromAddress = async (address) => {
  try {
    const res = await axios.get(
      "https://dapi.kakao.com/v2/local/search/address.json",
      {
        params: { query: address },
        headers: { Authorization: KAKAO_REST_API_KEY },
      }
    );

    const { documents } = res.data;
    if (!documents.length) {
      console.warn("[주소 검색 실패]", address);
      return null;
    }
    return {
      lat: parseFloat(documents[0].y),
      lng: parseFloat(documents[0].x),
    };
  } catch (err) {
    console.error("좌표 변환 실패:", err);
    return null;
  }
};

/* =========================
 * 거리 계산 (하버사인) - km
 * ========================= */

export const calculateDistance = async (addresses) => {
  const coordsList = await Promise.all(addresses.map(getCoordsFromAddress));
  const validCoords = coordsList.filter(Boolean);

  if (validCoords.length < 2) {
    console.warn("[거리 계산 실패] 유효한 좌표가 2개 이상 필요");
    return null;
  }

  let total = 0;
  for (let i = 0; i < validCoords.length - 1; i++) {
    const { lat: lat1, lng: lng1 } = validCoords[i];
    const { lat: lat2, lng: lng2 } = validCoords[i + 1];
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371; // km
    total += R * c;
  }

  return total;
};

/* =========================
 * 예상 금액 API
 * ========================= */

export const fetchExpectedPay = async ({ distance, weight, hasSpecialCargo }) => {
  try {
    const { data } = await http.post("/api/company/ExpectedPay", {
      distance,
      weight,
      special: hasSpecialCargo,
    });
    return data?.price ?? 0;
  } catch (error) {
    console.error("예상금액 계산 API 실패:", error);
    return 0;
  }
};

/* =========================
 * 배송요청 저장
 * ========================= */

/**
 * 🚀 배송요청 저장
 * 백엔드 컨트롤러가 CreateProposeRequest(payment, request) 구조를 받으므로
 * 프론트에서는 { payment, request } 로 감싸서 보내야 함
 */
export const createDeliveryRequest = async (requestPayload, paymentPayload = null) => {
  try {
    const wrapped = {
      payment: paymentPayload, // 결제 정보 (없으면 null)
      request: requestPayload, // DeliveryRequestRequestDTO
    };
    const { data } = await http.post("/api/delivery/requests", wrapped);
    return data;
  } catch (error) {
    if (error.response) {
      console.error(
        "[createDeliveryRequest 실패]",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("[createDeliveryRequest 실패]", error.message);
    }
    throw error;
  }
};

/* =========================
 * 차량 종류
 * ========================= */

export const fetchVehicleTypes = async () => {
  const { data } = await http.get("/api/vehicle-types");
  return data || [];
};

/* =========================
 * 화물 종류
 * ========================= */

export const fetchCargoTypes = async () => {
  try {
    const { data } = await http.get("/api/cargo-types");
    return data || [];
  } catch (error) {
    console.error("화물 종류 로드 실패:", error);
    return [];
  }
};

/* =========================
 * 저장된 기본 주소 (DB)
 * ========================= */

export const fetchSavedAddresses = async (companyId) => {
  if (!companyId) return [];
  const { data } = await http.get("/api/saved-addresses", {
    params: { companyId },
  });
  return data || [];
};

export const saveSavedAddressesBulk = async (companyId, items) => {
  const { data } = await http.post("/api/saved-addresses/bulk", {
    companyId,
    items,
  });
  return data;
};

export const deleteSavedAddress = async (id) => {
  await http.delete(`/api/saved-addresses/${id}`);
};

export default http;
