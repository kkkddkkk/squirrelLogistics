import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api/public";

export const getActualCalc = async ({ assignedId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/actualCalc`, {
      params: { assignedId, ...options }, // GET 쿼리 파라미터로 전달
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getEstimateCalc = async ({ requestId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/actualCalc/thisEstimate`, {
      params: { requestId, ...options }, // GET 쿼리 파라미터로 전달
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const trySecondPayment = async({paymentId})=>{
  try{
    const res = await axios.post(`${API_SERVER_HOST}/payment/secondTry/${paymentId}`, {paymentId});
    console.log(res.data);
  }catch(err){
    console.log(err);
  }
};

    // const handlePayment = () => {
    //     if (assignedId != 0)
    //         trySecondPayment({ paymentId })
    //             .then(data => {
    //                 moveToSecondPayment(paymentId); --> 원하는 페이지로 이동
    //             })
    //             .catch(err => {
    //                 console.error("row 생성 실패", err);
    //             });
    // }