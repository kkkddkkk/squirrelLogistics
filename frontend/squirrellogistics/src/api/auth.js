import axios from "axios";
const BASE = "/api/admin";

// 이메일/비번 인증
export const adminLogin    = creds => axios.post(`${BASE}/login`, creds);
export const adminRegister = creds => axios.post(`${BASE}/signup`, creds);

// Google OAuth
export const googleLogin    = token => axios.post(`${BASE}/googleLogin`,  { token });
export const googleRegister = token => axios.post(`${BASE}/googleSignup`, { token });

// 이메일 인증
export const sendEmailCode   = email => axios.post(`${BASE}/send-email-code`, { email });
export const verifyEmailCode = (email, code) =>
  axios.post(`${BASE}/verify-email-code`, { email, code });

// SMS 인증
export const sendSmsCode   = phone => axios.post(`${BASE}/send-sms-code`, { phone });
export const verifySmsCode = (phone, code) =>
  axios.post(`${BASE}/verify-sms-code`, { phone, code });

// 아이디·비번 찾기
export const findId               = ({ email }) => axios.post(`${BASE}/find-id`, { email });
export const requestPasswordReset = ({ email }) => axios.post(`${BASE}/password-reset`, { email });
