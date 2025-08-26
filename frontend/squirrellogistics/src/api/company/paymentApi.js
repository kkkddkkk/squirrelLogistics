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
  try {
    const res = await axios.put(`${API_SERVER_HOST}/first/${paymentId}/success`, {
      ...successFirstPayment,
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

//2차 결제 성공
export const successSecondPayment = async ({ paymentId, options = {}, successSecondPayment }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/second/${paymentId}/success`, {
      ...successSecondPayment,
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


export const refund = async (refundDTO) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/cancel`, refundDTO, {
      headers: {
        Authorization: `Bearer ${accesstoken}`, // JWT 토큰 추가
      },
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }

}
