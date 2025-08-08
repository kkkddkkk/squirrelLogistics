import axios from "axios";

const BASE = "/api/notices";

export const getNotices = () => axios.get(BASE).then(res => res.data);
export const getNoticeById = (id) => axios.get(`${BASE}/${id}`).then(res => res.data);
export const createNotice = (data) => axios.post(BASE, data);
export const updateNotice = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteNotice = (id) => axios.delete(`${BASE}/${id}`);
