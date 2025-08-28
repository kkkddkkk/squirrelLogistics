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

//전체환불
// export async function requestRefund(refundDTO) {
//   try {
//     const response = await fetch("http://localhost:8080/api/refund", {
//       method: "POST",
//       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}`, },
//       body: JSON.stringify(refundDTO),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result.error || "환불 실패");
//     }

//     return result;
//   } catch (err) {
//     console.error("환불 요청 중 오류:", err.message);
//     throw err; // 호출한 쪽에서 catch 가능
//   }
// }

export async function cancelPayment(impUid, reason = "고객 요청") {
  try {
    const response = await fetch(`/api/payments/${impUid}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accesstoken}`
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`환불 실패: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err; // 호출 쪽에서 catch 할 수 있도록
  }
}
