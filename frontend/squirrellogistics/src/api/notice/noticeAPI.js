import axios from "axios";
import { getAuthHeaders, buildConfig } from "../deliveryRequest/apiUtil";
import { API_SERVER_HOST } from "../deliveryRequest/deliveryRequestAPI";

const BASE = `${API_SERVER_HOST}/api/notices`;

export async function createNotice(body, options = {}) {
    const { data } = await axios.post(`${BASE}`, body, buildConfig(options));
    return data;
}

/** 2) 목록 조회 (검색/필터 포함) */
export async function fetchNotices(params = {}, options = {}) {

    const cfg = buildConfig({ ...options, params });
    console.log(cfg);
    const { data } = await axios.get(`${BASE}`, cfg);
    return data; // RequestPageResponseDTO
}

/** 3) 기존 공지 수정 */
export async function updateNotice(id, body, options = {}) {
    console.log("[EditPage] updateNotice typeof:", typeof updateNotice);
     const res = await axios.put(`${BASE}/${id}`, body, buildConfig(options));
    console.log("[API] PUT status:", res.status);
}

/** 5) 단건 공지 조회 (increaseView=true면 조회수 +1) */
export async function fetchNotice(id, increaseView = true, options = {}) {
    const cfg = buildConfig({ ...options, params: { increaseView } });
    const { data } = await axios.get(`${BASE}/${id}`, cfg);
    return data; // NoticeDetailRequestDTO
}

/** 6) 기존 공지 삭제 */
export async function deleteNotice(id, options = {}) {
    await axios.delete(`${BASE}/${id}`, buildConfig(options));
}

export async function toggleNoticePinned(id, pinned, options = {}) {
    const res = await axios.patch(
        `${BASE}/${id}/pin`,
        null,
        buildConfig({ params: { pinned }, ...options })
    );
    return res.data;
}