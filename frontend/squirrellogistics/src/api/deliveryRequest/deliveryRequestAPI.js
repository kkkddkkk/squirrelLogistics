import axios from "axios";

// 백엔드 서버 주소.
export const API_SERVER_HOST = "http://localhost:8080";
const BASE = `${API_SERVER_HOST}/api/delivery/requests`;


//1. 목록 조회 
//PageResponseDTO<DeliveryRequestSlimResponseDTO>로 도착.
//pageReq=>{ page, size, sort, dir }
//page: 1부터 시작.
//size: 페이지 크기.
//sort: 정렬 기준 컬럼명, createdAt등.
//dir: "ASC" 혹은 "DESC".

// export async function fetchDeliveryRequests(pageReq = {}) {
//     const params = {
//         page: pageReq.page ?? 1,
//         size: pageReq.size ?? 10,
//         sort: pageReq.sort ?? "createAt",
//         dir: pageReq.dir ?? "DESC",
//     };
//     const res = await axios.get(`${BASE}`, { params });
//     return res.data; //<= PageResponseDTO.
// }


export async function fetchDeliveryRequests(pageReq = {}) {
  const params = {
    page: pageReq.page ?? 1,
    size: pageReq.size ?? 10,

    sortKey: pageReq.sortKey ?? 'RECENT',

    // 검색, 날짜 필터
    q: pageReq.q ?? '',
    scope: pageReq.scope ?? '',         
    startDate: pageReq.startDate ?? '', 
  };
  const res = await axios.get(`${BASE}`, { params });
  return res.data; // PageResponseDTO
}

//2. 개별 요청 정보 조회
//DeliveryRequestResponseDTO로 도착
export async function fetchDeliveryRequest(id, driverId, options = {}) {
  const { signal, ...rest } = options; // signal만 분리
  const res = await axios.get(`${BASE}/${id}`, {
    params: { driverId },
    signal,              
    ...rest              
  });
  return res.data;
}


//3. 새 요청 생성
//DeliveryRequestRequestDTO를 전송, 생성된 id 도착.
export async function createDeliveryRequest(payload) {
    const res = await axios.post(`${BASE}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data; // created id
}


//4. 운송 요청 게시글 수정.
//DeliveryRequestRequestDTO를 전송, 리턴없음.
export async function updateDeliveryRequest(id, payload) {
    await axios.put(`${BASE}/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
}

//5. 운송 요청 게시글 삭제.
//id를 전송, 리턴없음.
export async function deleteDeliveryRequest(id) {
    await axios.delete(`${BASE}/${id}/accept`);
}

//6. 운송 요청 게시글 수락.
//{"SUCCESS": "ACCEPTED"}
//{"FAILED": "REQUEST_ALREADY_TAKEN"}
export async function acceptDeliveryRequest(id, driverId) {
  const res = await axios.put(`${BASE}/${id}/accept`, null, {
    params: { driverId }
  });
  return res.data;
}