import axios from "axios";
import { getAuthHeaders, buildConfig } from "./apiUtil";
// 백엔드 서버 주소.
export const API_SERVER_HOST = "http://localhost:8080";
const BASE = `${API_SERVER_HOST}/api/delivery/proposals`;

//driverId에 할당된 운송 제안 목록
export async function fetchDeliveryProposals(options = {}) {
  try {
    const res = await axios.get(`${BASE}`, buildConfig(options));
    return res.data; 
  } catch (e) {
    throw e; 
  }
}


//내게 제안된 요청 거절.
export async function declineDeliveryProposal(requestId, options = {}) {
  try {
    const res = await axios.put(
      `${BASE}/${requestId}/decline`,
      null,
      buildConfig(options)
    );
    return res.data;
  } catch (e) {
    const status = e.response?.status;
    const code = e.response?.data?.FAILED || "UNKNOWN";
    throw Object.assign(new Error(code), { status, code });
  }
}

//내게 제안된 요청 수락.
// export async function acceptDeliveryProposal(requestId, options = {}) {
//   try {
//     const res = await axios.put(
//       `${BASE}/${requestId}/accept`,
//       null,
//       buildConfig(options)
//     );
//     return res.data;
//   } catch (e) {
//     const status = e.response?.status;
//     const code = e.response?.data?.FAILED || "UNKNOWN";
//     throw Object.assign(new Error(code), { status, code });
//   }
// }

export async function acceptDeliveryProposal(requestId, options = {}) {
  try {
    const res = await axios.put(
      `${BASE}/${requestId}/accept`,
      null,
      buildConfig(options)
    );
    return res.data; // 성공 시 그대로 리턴
  } catch (e) {
    const status = e.response?.status ?? 0;
    const body = e.response?.data;
    const code =
      typeof body === 'string'
        ? body                              // ← 문자열 본문
        : body?.FAILED || body?.code || 'UNKNOWN'; // ← 객체 본문

    const err = new Error(code);
    err.status = status;
    err.code = code;
    throw err;
  }
}