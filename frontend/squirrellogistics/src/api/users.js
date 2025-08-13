// src/api/users.js
import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
});

// 목록 조회 (검색/페이지)
export const fetchUsers = async ({ page = 1, size = 10, keyword = "", role = "" } = {}) => {
  // 실제 API가 정해지기 전 임시 쿼리
  const { data } = await client.get("/admin/users", {
    params: { page, size, keyword, role }
  });
  return data; // { items: [], total: 0 }
};

// 단건 조회
export const fetchUserById = async (id) => {
  const { data } = await client.get(`/admin/users/${id}`);
  return data; // { id, name, email, phone, role, status, ... }
};

// 생성
export const createUser = async (payload) => {
  const { data } = await client.post("/admin/users", payload);
  return data;
};

// 수정
export const updateUser = async (id, payload) => {
  const { data } = await client.put(`/admin/users/${id}`, payload);
  return data;
};

// 삭제
export const deleteUser = async (id) => {
  const { data } = await client.delete(`/admin/users/${id}`);
  return data;
};
