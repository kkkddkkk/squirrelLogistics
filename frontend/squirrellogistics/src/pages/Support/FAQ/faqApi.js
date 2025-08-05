import axios from "axios";

const BASE = "/api/faqs";

export const getFaqs = () => axios.get(BASE).then(res => res.data);
export const getFaqById = (id) => axios.get(`${BASE}/${id}`).then(res => res.data);
export const createFaq = (data) => axios.post(BASE, data);
export const updateFaq = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteFaq = (id) => axios.delete(`${BASE}/${id}`);
