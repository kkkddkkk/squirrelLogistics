import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";

const BASE = `${API_SERVER_HOST}/delivery/assignments`;

export async function fetchTodayDelivery(driverId, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/today`, {
    params: { driverId },
    signal,
    ...rest,
  });
  return res.data;
}

// 액션 호출 (FSM 입력)
export async function postDriverAction(assignedId, action) {
  const res = await axios.post(`${BASE}/${assignedId}/action?action=${action}`);
  return res.data;
}
