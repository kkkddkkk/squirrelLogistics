import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api/report";
const accesstoken = localStorage.getItem('accessToken');

export const getReportList = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/list`, {
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

export const getReportView = async ({ reportId, options = {} }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}`, {
      params: { reportId, ...options }, // GET 쿼리 파라미터로 전달
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