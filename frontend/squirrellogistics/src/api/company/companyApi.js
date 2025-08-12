// src/api/company/companyApi.js
import axios from "axios";

// ✅ 0) 아이디/비밀번호로 본인인증
export const verifyCredentials = async ({ loginId, password }) => {
  try {
    const res = await axios.post("/api/company/verify", { loginId, password });
    // { ok: true } 형태라고 가정
    return !!res.data?.ok;
  } catch (err) {
    console.error("❌ 본인인증 실패:", err);
    return false;
  }
};

/* ✅ 0-1) 비밀번호 재설정 링크(단발성 토큰) 요청
   서버에서 해당 이메일로 토큰이 담긴 URL을 전송해야 합니다.
   예) POST /api/company/password/reset/request  { email }
   응답 예: { ok: true } */
export const requestPasswordReset = async (email) => {
  try {
    const res = await axios.post("/api/company/password/reset/request", { email });
    return !!res.data?.ok;
  } catch (err) {
    console.error("❌ 비밀번호 재설정 링크 요청 실패:", err);
    return false;
  }
};

// ✅ 0-2) 회원정보 수정 저장
export const updateCompanyProfile = async (payload) => {
  // payload: { newPassword?, bankName, accountNumber, address, addressDetail }
  try {
    const res = await axios.put("/api/company/profile", payload);
    return res.data; // 갱신된 userInfo를 돌려준다고 가정
  } catch (err) {
    console.error("❌ 회원정보 수정 실패:", err);
    throw err;
  }
};

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
