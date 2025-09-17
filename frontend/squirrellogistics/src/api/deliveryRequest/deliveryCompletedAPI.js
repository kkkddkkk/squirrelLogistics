import axios from "axios";
import { API_SERVER_HOST } from "../deliveryRequest/deliveryRequestAPI";

const BASE = `${API_SERVER_HOST}/api/delivery/completed`;

// Authorization 헤더를 가져오는 함수
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 완료된 운송 목록 조회
export async function fetchCompletedDeliveries() {
  const res = await axios.get(`${BASE}/list`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

// 운송 상세 정보 조회
export async function fetchDeliveryDetail(assignedId) {
  const res = await axios.get(`${BASE}/${assignedId}/detail`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}
