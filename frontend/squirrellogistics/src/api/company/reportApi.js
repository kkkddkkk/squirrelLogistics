import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";

const accesstoken = localStorage.getItem('accessToken');

export const getReportList = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/report/list`, {
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
    const res = await axios.get(`${API_SERVER_HOST}/report`, {
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

//작성자: 고은설.
//기능: 긴급 신고 등 운전자단 신고 삽입 요청.
export const fetchRegisterReport = async ({ reportData}) => {
  console.log("fetchRegisterReport");

  try {
    const res = await axios.post(
      `${API_SERVER_HOST}/driver-report/regist`,
      reportData,
      {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const fetchDriverReportList = async () => {
  console.log("fetchDriverReportList");

  try {
    const res = await axios.get(
      `${API_SERVER_HOST}/driver-report/list`,
      null,
      {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};