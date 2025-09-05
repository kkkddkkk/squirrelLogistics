import axios from "axios";
import { getAuthHeaders, buildConfig } from "./apiUtil"; // ← 경로 확인
// 백엔드 서버 주소.
export const API_SERVER_HOST = "http://localhost:8080";
const BASE = `${API_SERVER_HOST}/api/delivery/requests`;

export async function fetchDeliveryRequests(pageReq = {}, options = {}) {
  const params = {
    page: pageReq.page ?? 1,
    size: pageReq.size ?? 10,
    sortKey: pageReq.sortKey ?? "RECENT",
    q: pageReq.q ?? "",
    scope: pageReq.scope ?? "",
    startDate: pageReq.startDate ?? "",
  };

  const res = await axios.get(`${BASE}`, buildConfig({ params, ...options }));

  return res.data;
}

// 2. 개별 요청 정보 조회
// DeliveryRequestResponseDTO로 도착
export async function fetchDeliveryRequest(id, options = {}) {
  const res = await axios.get(`${BASE}/${id}`, buildConfig(options));
  return res.data;
}

//3. 새 요청 생성
//DeliveryRequestRequestDTO를 전송, 생성된 id 도착.
export async function createDeliveryRequest(payload, options = {}) {
  const res = await axios.post(
    `${BASE}`,
    payload,
    buildConfig({
      headers: { "Content-Type": "application/json" },
      ...options,
    })
  );
  return res.data;
}

//4. 운송 요청 게시글 수정.
//DeliveryRequestRequestDTO를 전송, 리턴없음.
export async function updateDeliveryRequest(id, payload, options = {}) {
  await axios.put(
    `${BASE}/${id}`,
    payload,
    buildConfig({
      headers: { "Content-Type": "application/json" },
      ...options,
    })
  );
}

//5. 운송 요청 게시글 삭제.
//id를 전송, 리턴없음.
export async function deleteDeliveryRequest(id, options = {}) {
  await axios.delete(`${BASE}/${id}/accept`, buildConfig(options));
}

//6. 운송 요청 게시글 수락.
export async function acceptDeliveryRequest(id, driverId, options = {}) {
  try {
    const res = await axios.put(
      `${BASE}/${id}/accept`,
      null,
      buildConfig({ ...options })
    );

    // 성공(2xx)
    if (res.status === 204) {
      return { ok: true, code: "ALREADY_ACCEPTED", httpStatus: 204 };
    }
    if (res.status === 200) {
      const data = res.data;
      if (data?.SUCCESS) {
        return { ok: true, code: "SUCCESS", payload: data, httpStatus: 200 };
      }
      if (data?.FAILED) {
        return { ok: false, code: data.FAILED, httpStatus: 200, raw: data };
      }
      return { ok: true, code: "SUCCESS", payload: data, httpStatus: 200 };
    }

    return { ok: true, code: "SUCCESS", payload: res.data, httpStatus: res.status };
  } catch (err) {
    console.log(err);
    const status = err.response?.status;
    const code = extractCodeFromData(err.response?.data);
    return { ok: false, code, httpStatus: status, raw: err.response?.data };
  }
}

const ACCEPT_MESSAGES = {
  SUCCESS: "운송 요청이 성공적으로 수락되었습니다.",
  ALREADY_ACCEPTED: "이 운송 요청은 이미 수락되어 있습니다.",
  REQUEST_ALREADY_TAKEN: "이미 다른 기사님이 수락한 요청입니다.",
  REQUEST_NOT_FOUND: "요청을 찾을 수 없습니다(삭제/마감되었을 수 있어요).",
  DRIVER_NOT_FOUND: "기사 정보를 찾을 수 없습니다.",
  VEHICLE_TYPE_MISMATCH: "차량 종류가 요청 조건과 일치하지 않습니다.",
  SCHEDULE_CONFLICT: "해당 일자에 겹치는 배차가 있습니다.",
  INVALID_STATE: "해당 지명을 수락할 수 있는 상태가 아닙니다.",
  PROPOSAL_NOT_FOUND: "해당 지명 요청을 찾을 수 없습니다.",
  FORBIDDEN: "잘못된 접근입니다.",
  ACCEPTED: "운송 요청이 성공적으로 수락되었습니다.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
};

export function msg(code) {
  return ACCEPT_MESSAGES[code] || ACCEPT_MESSAGES.UNKNOWN;
}

export function extractCodeFromData(data) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return data.FAILED || data.code || data.error || "UNKNOWN";
  }
  return "UNKNOWN";
}
