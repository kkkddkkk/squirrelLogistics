import axios from "axios";
import { getAuthHeaders, buildConfig } from "./apiUtil";
import { extractCodeFromData } from "./deliveryRequestAPI";
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

    if (res.status === 204) {
      return { ok: true, code: "ALREADY_ACCEPTED", httpStatus: 204 };
    }
    if (res.status === 200) {
      const data = res.data;
      if (data?.SUCCESS) {
        return { ok: true, code: data.SUCCESS, payload: data, httpStatus: 200 };
      }
      if (data?.FAILED) {
        return { ok: false, code: data.FAILED, httpStatus: 200, raw: data };
      }
      return { ok: true, code: "SUCCESS", payload: data, httpStatus: 200 };
    }
    return { ok: true, code: "SUCCESS", payload: res.data, httpStatus: res.status };
  } catch (err) {
    const status = err.response?.status ?? 0;
    const code = extractCodeFromData(err.response?.data);
    return { ok: false, code, httpStatus: status, raw: err.response?.data };
  }
}