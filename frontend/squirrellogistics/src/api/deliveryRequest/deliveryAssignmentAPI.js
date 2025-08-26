import axios from 'axios';

export const API_SERVER_HOST = "http://localhost:8080";
const BASE = `${API_SERVER_HOST}/api/delivery/assignments`;

// 오늘 진행중인 운송 정보 가져오기.
export async function fetchTodayDelivery(driverId, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/today`, { params: { driverId }, signal, ...rest });
  return res.data;
}

// 진행 중 운송 상태값 변경 액션 호출 (FSM 입력 필요).
export async function postDriverAction(assignedId, action) {
  const res = await axios.post(`${BASE}/${assignedId}/action?action=${action}`);
  return res.data;
}

// 드라이버 월별 일정 정보 목록 조회.
export async function fetchDriverMonthlySchedule(driverId, year, month, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/${driverId}/schedules`, { params: { year, month }, signal, ...rest });
  return res.data; // DriverScheduleDTO 리턴됨.
}

// 드라이버의 "예약된, 완료 전" 운송 일정 정보 상세 조회.
export async function fetchDeliveryReservationById(driverId, requestId, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/${driverId}/reservations/${requestId}`, { signal, ...rest });
  return res.data; // DeliveryRequestResponseDTO
}

// 드라이버의 "완료된" 운송 일정 히스토리 상세 조회.
export async function fetchDeliveryHistoryById(driverId, assignedId, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/${driverId}/history/${assignedId}`, { signal, ...rest });
  return res.data; // DeliveryRequestResponseDTO
}

// 드라이버의 완료 운송에 대한 리뷰 목록 가져오기.
export async function fetchDriverReviews(driverId, { page = 0, size = 10 } = {}, options = {}) {
  const { signal, ...rest } = options;
  const res = await axios.get(`${BASE}/${driverId}/reviews`, {
    params: { page, size },  //페이지 0부터 시작임.
    signal,
    ...rest,
  });
  return res.data;       
}
