import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api/public/payment";

export const getSecondPayBox = async ({ prepaidId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/second/${prepaidId}`, {
      params: { prepaidId, ...options }, // GET 쿼리 파라미터로 전달
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const ModifySecondPayment = async ({ paymentId, options = {}, secondPayment }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}`, {
      ...secondPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(res.data);
    return res.data;
  } catch(err) {
    console.error(err);
  }
};

export const successSecondPayment = async ({ paymentId, options = {}, successSecondPayment }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}/success`, {
      ...successSecondPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(res.data);
    return res.data;
  } catch(err) {
    console.error(err);
  }
};

export const failureSecondPayment = async ({ paymentId, options = {}, failureSecondPayment }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}/failure`, {
      ...failureSecondPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(res.data);
    return res.data;
  } catch(err) {
    console.error(err);
  }
};