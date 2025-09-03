import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api/payment";
const accesstoken = localStorage.getItem('accessToken');

//1차 payBox 랜더링
export const getFirstPayBox = async ({ paymentId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/first/${paymentId}`, {
      params: { paymentId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

//2차 payBox 랜더링
export const getSecondPayBox = async ({ prepaidId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/second/${prepaidId}`, {
      params: { prepaidId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};


//1차 결제 성공
export const successFirstPayment = async ({ paymentId, options = {}, successFirstPayment }) => {
  if (successFirstPayment === undefined) return;
  console.log(">>> 1차 결제 API 요청 시작", successFirstPayment);
  try {
    const res = await axios.put(`${API_SERVER_HOST}/first/${paymentId}/success`, {
      ...successFirstPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accesstoken}` }
    });
    console.log(">>> 1차 결제 API 요청 도착", res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

//2차 결제 성공
export const successSecondPayment = async ({ paymentId, options = {}, successSecondPayment }) => {
  if (successSecondPayment === undefined) return;
  console.log(">>> 2차 결제 API 요청 시작", successSecondPayment);
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}/success`, {
      ...successSecondPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accesstoken}` }
    });
    console.log(">>> 2차 결제 API 요청 도착", res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

//환불 성공
export const successRefundPayment = async ({ paymentId, options = {}, refundPayment }) => {
  if (refundPayment === undefined) return;
  console.log(">>> 2차 결제 API 요청 시작", refundPayment);
  try {
    const res = await axios.put(`${API_SERVER_HOST}/refund/${paymentId}/success`, {
      ...refundPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accesstoken}` }
    });
    console.log(">>> 2차 결제 API 요청 도착", res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

//결제 실패
export const failureSecondPayment = async ({ paymentId, options = {}, failureSecondPayment }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}/failure`, {
      ...failureSecondPayment,
      ...options,  // 필요하면 옵션을 body에 병합
    }, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accesstoken}` }
    });
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

//영수증 보기
export const getReciept = async ({ paymentId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/reciept`, {
      params: { paymentId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

//명세서 보기
export const getTransactionStatement = async ({ paymentId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/transactionStatement`, {
      params: { paymentId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};


//작성자: 고은설
//기능: 추가 결제금 없는 건에 대하여 단순 2차 결제 완료 처리.
export const fetchCompleteWithoutPayment = async ({ paymentId, options = {} }) => {
  try {
    const res = await axios.put(
      `${API_SERVER_HOST}/second/${paymentId}/complete-without-payment`,
      null,
      {
        params: { ...options },
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("[WARN!]: ", err);
    //throw err; <-- 필요시 프론트에서 throw할 수 있습니다!
  }
};
