import axios from "axios";

// 백엔드 서버 주소.
export const API_SERVER_HOST = "http://localhost:8080";
const BASE = `${API_SERVER_HOST}/api/delivery/proposals`;

//driverId에 할당된 운송 제안 목록
export function fetchDeliveryProposals(driverId, options = {}) {
  return axios
    .get(`${BASE}`, {
      params: { driverId },  
      ...options,
    })
    .then(res => res.data);
}

//내게 제안된 요청 거절.
export async function declineDeliveryProposal(requestId, driverId) {
  try {
    const res = await axios.put(`${BASE}/${requestId}/decline`, null, {
      params: { driverId },
      // headers: { Authorization: `Bearer ${token}` } // 추후 인증 필요.
    });
    return res.data;
  } catch (e) {
    const status = e.response?.status;
    const code = e.response?.data?.FAILED || 'UNKNOWN';
    throw Object.assign(new Error(code), { status, code });
  }
}

//내게 제안된 요청 수락.
export async function acceptDeliveryProposal(requestId, driverId) {
  try {
    const res = await axios.put(`${BASE}/${requestId}/accept`, null, {
      params: { driverId },
      // headers: { Authorization: `Bearer ${token}` } // 추후 인증 필요.
    });
    return res.data;
  } catch (e) {
    const status = e.response?.status;
    const code = e.response?.data?.FAILED || 'UNKNOWN';
    throw Object.assign(new Error(code), { status, code });
  }
}