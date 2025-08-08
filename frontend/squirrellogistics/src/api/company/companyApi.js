// src/api/company/companyApi.js

import axios from "axios";

// ✅ 1. 회원정보 불러오기
export const getUserInfo = async () => {
  try {
    const res = await axios.get("/api/company/info");
    return res.data;
  } catch (err) {
    console.error("❌ 회원정보 불러오기 실패:", err);
    return null;
  }
};

// ✅ 2. 배송리스트 불러오기
export const getDeliveryList = async () => {
  try {
    const res = await axios.get("/api/company/deliveries");
    return res.data;
  } catch (err) {
    console.error("❌ 배송 정보 불러오기 실패:", err);
    return [];
  }
};
