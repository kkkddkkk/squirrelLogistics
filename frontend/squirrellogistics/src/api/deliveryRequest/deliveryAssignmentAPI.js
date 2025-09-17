import axios from 'axios';
import {buildConfig} from './apiUtil'
import { API_SERVER_HOST } from "../deliveryRequest/deliveryRequestAPI";

const BASE = `${API_SERVER_HOST}/api/delivery/assignments`;


// 오늘 진행중인 운송 정보 가져오기.
export async function fetchTodayDelivery(options = {}) {
  try {
    const res = await axios.get(`${BASE}/today`, buildConfig(options));
    return res.data;
  } catch (err) {
    console.error("[fetchTodayDelivery] failed:", err.response?.status, err.response?.data || err.message);
    throw err; // 호출한 쪽에서 다시 try/catch 가능
  }
}

// 진행 중 운송 상태값 변경 액션 호출 (FSM 입력 필요 + 완료 시점에는 산간 지역 및 취급주의 여부 함께 전달 필요).
export async function postDriverAction(assignedId, action, { detour = false, ...extras } = {}, options = {}) {
  const res = await axios.post(
    `${BASE}/${assignedId}/action`,
    extras,
    {
      ...buildConfig(options),
      params: { action, detour },
    }
  );
  return res.data;
}

// 드라이버 월별 일정 정보 목록 조회.
export async function fetchDriverMonthlySchedule(year, month, options = {}) {
  const res = await axios.get(
    `${BASE}/schedules`,
    {
      ...buildConfig(options),
      params: { year, month },
    }
  );
  return res.data; // DriverScheduleDTO
}

// 드라이버의 "예약된, 완료 전" 운송 일정 정보 상세 조회.
export async function fetchDeliveryReservationById(requestId, options = {}) {
  const res = await axios.get(
    `${BASE}/reservations/${requestId}`,
    buildConfig(options)
  );
  return res.data; // DeliveryRequestResponseDTO
}

// 드라이버의 "완료된" 운송 일정 히스토리 상세 조회.
export async function fetchDeliveryHistoryById(assignedId, options = {}) {
  try {
    const res = await axios.get(
      `${BASE}/history/${assignedId}`,
      buildConfig(options)
    );
    return res.data; // DriverDeliveryHistoryDTO
  } catch (error) {
    if (error.response) {
      console.error(
        "[fetchDriverHistory 실패]",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("[fetchDriverHistory 실패]", error.message);
    }
    throw error;
  }
}

// 드라이버의 완료 운송에 대한 리뷰 목록 가져오기.
export async function fetchDriverReviews({ page = 0, size = 10 } = {}, options = {}) {
  const res = await axios.get(
    `${BASE}/reviews`,
    {
      ...buildConfig(options),
      params: { page, size }, // 페이지 0부터
    }
  );
  return res.data;
}

export async function cancelDeliveryReservation(requestId, options = {}) {
  try {
    const res = await axios.put(
      `${BASE}/cancel/${requestId}`,
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