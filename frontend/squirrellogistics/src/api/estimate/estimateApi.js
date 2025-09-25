import axios from "axios";
import { getRouteDistanceFromAddresses } from "../../hook/DeliveryMap/useKakaoRouteMap";
import API_SERVER_HOST from "../apiServerHost";

/* =========================
 * 기본 설정
 * ========================= */

// ✅ Kakao Developers REST API 키
const KAKAO_REST_API_KEY = "KakaoAK c0e48ee321373e897ad48c8bf2d72460";

// 공통 axios 인스턴스
const http = axios.create({
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
  } catch (_) { }
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
      // console.warn("[주소 검색 실패]", address);
      return null;
    }
    return {
      lat: parseFloat(documents[0].y),
      lng: parseFloat(documents[0].x),
    };
  } catch (err) {
    // console.error("좌표 변환 실패:", err);
    return null;
  }
};

/* =========================
 * 거리 계산 (하버사인) - km
 * ========================= */

//TO DO: 길찾기로 바꾸기.
export const calculateDistance = async (addresses) => {
  const coordsList = await Promise.all(addresses.map(getCoordsFromAddress));
  const validCoords = coordsList.filter(Boolean);

  if (validCoords.length < 2) {
    // console.warn("[거리 계산 실패] 유효한 좌표가 2개 이상 필요");
    return null;
  }

  // 카카오 내비 API 기반 거리(m)
  const meters = await getRouteDistanceFromAddresses(addresses);

  // km 변환 후 올림 처리
  const km = Math.ceil(meters / 1000);

  // console.log(`${km} km`);

  return km; // 정수 km
};
/* =========================
 * 예상 금액 API
 * ========================= */

export const fetchExpectedPay = async ({ distance, weight, hasSpecialCargo }) => {
  try {
    const { data } = await http.post(`${API_SERVER_HOST}/company/ExpectedPay`, {
      distance,
      weight,
      special: hasSpecialCargo,
    });
    return data?.price ?? 0;
  } catch (error) {
    // console.error("예상금액 계산 API 실패:", error);
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
    const wrapped = { payment: paymentPayload, request: requestPayload };
    // console.log(wrapped);
    const { data } = await http.post(`${API_SERVER_HOST}/delivery/requests`, wrapped);

    return data;
  } catch (error) {
    // if (error.response) {
    //   console.error("[createDeliveryRequest 실패]", error.response.status, error.response.data);
    // } else {
    //   console.error("[createDeliveryRequest 실패]", error.message);
    // }
    throw error;
  }
};

//작성자: 고은설.
export const createDeliveryPropose = async (
  requestPayload,
  paymentPayload,
  driverId
) => {
  try {
    const wrapped = {
      request: requestPayload,
      payment: paymentPayload,
      driverId: driverId
    };

    console.log(wrapped.request);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await http.post(
      `${API_SERVER_HOST}/delivery/requests/propose`,
      wrapped,
      { headers }
    );

    return data;
  } catch (error) {
    // if (error.response) {
    //   console.error(
    //     "[createDeliveryPropose 실패]",
    //     error.response.status,
    //     error.response.data
    //   );
    // } else {
    //   console.error("[createDeliveryPropose 실패]", error.message);
    // }
    throw error;
  }
};

// /**
//  * 🚛 기사 지명 요청 생성 (기존 createDeliveryRequest와 유사하지만 특정 기사에게만 요청)
//  * 
//  * @param {Object} requestDto - 배송 요청 정보
//  * @param {Object} paymentDto - 결제 정보  
//  * @param {number} driverId - 지명할 기사 ID
//  * @returns {Promise<number>} 생성된 요청 ID
//  */
// export const createDriverSpecificRequest = async (requestDto, paymentDto, driverId) => {
//   try {
//     console.log("=== 기사 지명 요청 생성 시작 ===");
//     console.log("requestDto:", requestDto);
//     console.log("paymentDto:", paymentDto);
//     console.log("driverId:", driverId);

//     // 인증 토큰 가져오기
//     const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};

//     const response = await axios.post(`${API_SERVER_HOST}/api/delivery/requests/driver-requests`, {
//       paymentDto: paymentDto,
//       requestDto: requestDto,
//       driverId: driverId
//     }, { headers });

//     console.log("기사 지명 요청 생성 성공:", response.data);

//     // 백엔드 응답 구조에 맞춰 requestId 추출
//     if (response.data.success && response.data.requestId) {
//       return response.data.requestId;
//     } else {
//       throw new Error(response.data.message || "요청 ID를 찾을 수 없습니다.");
//     }

//   } catch (error) {
//     console.error("기사 지명 요청 생성 실패:", error);
//     const errorMessage = error.response?.data?.message || error.message;
//     throw new Error(`기사 지명 요청 생성에 실패했습니다: ${errorMessage}`);
//   }
// };

// /**
//  * 📱 결제 완료 후 기사 지명 요청 전송
//  * 
//  * @param {number} requestId - 배송 요청 ID
//  * @param {number} paymentId - 결제 ID
//  * @returns {Promise<Object>} 전송 결과
//  */
// export const sendDriverRequestAfterPayment = async (requestId, paymentId) => {
//   try {
//     console.log("=== 결제 완료 후 기사 지명 요청 전송 시작 ===");
//     console.log("requestId:", requestId);
//     console.log("paymentId:", paymentId);

//     // 인증 토큰 가져오기
//     const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};

//     const response = await axios.post(`${API_SERVER_HOST}/api/delivery/requests/driver-requests/${requestId}/send`, {
//       paymentId
//     }, { headers });

//     console.log("기사 지명 요청 전송 성공:", response.data);

//     // 백엔드 응답 구조에 맞춰 처리
//     if (response.data.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data.message || "요청 전송에 실패했습니다.");
//     }

//   } catch (error) {
//     console.error("기사 지명 요청 전송 실패:", error);
//     const errorMessage = error.response?.data?.message || error.message;
//     throw new Error(`기사 지명 요청 전송에 실패했습니다: ${errorMessage}`);
//   }
// };

// /**
//  * 🔄 일반 요청과 기사 지명 요청 구분
//  * 
//  * @param {number} requestId - 배송 요청 ID
//  * @returns {Promise<boolean>} true: 기사 지명 요청, false: 일반 요청
//  */
// export const checkIfDriverSpecificRequest = async (requestId) => {
//   try {
//     // 인증 토큰 가져오기
//     const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};

//     const response = await axios.get(`${API_SERVER_HOST}/api/delivery/requests/requests/${requestId}/type`, { headers });

//     // 백엔드 응답 구조에 맞춰 isDriverSpecific 추출
//     if (response.data.success) {
//       return response.data.isDriverSpecific;
//     } else {
//       console.error("요청 타입 확인 실패:", response.data.message);
//       return false;
//     }
//   } catch (error) {
//     console.error("요청 타입 확인 실패:", error);
//     return false;
//   }
// };

/* =========================
 * 차량 종류
 * ========================= */

export const fetchVehicleTypes = async () => {
  const { data } = await http.get(`${API_SERVER_HOST}/vehicle-types`);
  return data || [];
};

/* =========================
 * 화물 종류
 * ========================= */

export const fetchCargoTypes = async () => {
  try {
    const { data } = await http.get(`${API_SERVER_HOST}/cargo-types`);
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
  const { data } = await http.get(`${API_SERVER_HOST}/saved-addresses`, {
    params: { companyId },
  });
  return data || [];
};

export const saveSavedAddressesBulk = async (companyId, items) => {
  const { data } = await http.post(`${API_SERVER_HOST}/saved-addresses/bulk`, {
    companyId,
    items,
  });
  return data;
};

export const deleteSavedAddress = async (id) => {
  await http.delete(`${API_SERVER_HOST}/saved-addresses/${id}`);
};

export default http;
