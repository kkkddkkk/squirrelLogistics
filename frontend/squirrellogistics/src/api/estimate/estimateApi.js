// src/api/estimate/estimateApi.js
import axios from "axios";

// API 서버 주소
const API_SERVER_HOST = "http://localhost:8080";

// 반드시 Kakao Developers에서 발급 받은 REST API 키 입력
const KAKAO_REST_API_KEY = "KakaoAK c0e48ee321373e897ad48c8bf2d72460";

// 📌 주소 → 좌표 변환
export const getCoordsFromAddress = async (address) => {
  try {
    const res = await axios.get("https://dapi.kakao.com/v2/local/search/address.json", {
      params: { query: address },
      headers: { Authorization: KAKAO_REST_API_KEY },
    });

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

// 📏 거리 계산 (하버사인 공식)
export const calculateDistance = async (addresses) => {
  console.log("[요청된 주소들]", addresses);
  const coordsList = await Promise.all(addresses.map(getCoordsFromAddress));
  const validCoords = coordsList.filter(Boolean);
  console.log("[변환된 좌표]", validCoords);

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

// 💰 예상 금액 계산 API 호출(선택)
export const fetchExpectedPay = async ({ distance, weight, hasSpecialCargo }) => {
  try {
    const response = await axios.post(`${API_SERVER_HOST}/api/company/ExpectedPay`, {
      distance,
      weight,
      special: hasSpecialCargo,
    });
    return response.data?.price ?? 0;
  } catch (error) {
    console.error("예상금액 계산 API 실패:", error);
    return 0;
  }
};

// 🚀 배송요청 저장 (Spring Boot: POST /api/delivery-requests)
export const createDeliveryRequest = async (payload) => {
  const res = await axios.post(
    `${API_SERVER_HOST}/api/delivery-requests`,
    payload,
    { withCredentials: true, headers: { "Content-Type": "application/json" } }
  );
  return res.data; // DeliveryRequestResponseDTO
};
