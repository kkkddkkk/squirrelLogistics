// src/api/deliveries.js
import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
});

// 목록 조회: keyword(주문번호/수취인), 상태, 기간(startDate, endDate), 페이지
export const fetchDeliveries = async ({
  page = 1,
  size = 10,
  keyword = "",
  status = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const { data } = await client.get("/admin/deliveries", {
    params: { page, size, keyword, status, startDate, endDate },
  });
  return data; // { items: [], total: 0 }
};

export const fetchDeliveryById = async (id) => {
  const { data } = await client.get(`/admin/deliveries/${id}`);
  return data;
};

export const createDelivery = async (payload) => {
  const { data } = await client.post("/admin/deliveries", payload);
  return data;
};

export const updateDelivery = async (id, payload) => {
  const { data } = await client.put(`/admin/deliveries/${id}`, payload);
  return data;
};

export const deleteDelivery = async (id) => {
  const { data } = await client.delete(`/admin/deliveries/${id}`);
  return data;
};
