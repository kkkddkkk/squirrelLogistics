import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api/companyHistory";
const accessToken = localStorage.getItem('accessToken');


export const getHistoryDate = async ({ options = {} }={}) => {//HistoryCalendar -> clear
  try {
    const res = await axios.get(`${API_SERVER_HOST}/calendar`, {
      params: { ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getHistoryList = async ({ date, options={} }) => {
    try {
        const res = await axios.get(API_SERVER_HOST, {
            params: { date, ...options },
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.data) return [];
        return res.data.map(item => ({
            assignedId: item[0],
            startAddress: item[1],
            endAddress: item[2],
            assignmentStatus: item[3],
            paymentStatus: item[4],
        }));
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const getTodayContent = async ({ assignedId, options = {} }) => {//HistoryList
  try {
    const res = await axios.get(`${API_SERVER_HOST}/getTodayContent`, {
      params: { assignedId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getDetailHistory = async ({ assignedId, options = {} }) => {//HistoryList
  try {
    const res = await axios.get(`${API_SERVER_HOST}/detailHistory`, {
      params: { assignedId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const cancel = async ({ assignedId, options = {} }) => {//HistoryList
  try {
    const res = await axios.put(`${API_SERVER_HOST}/cancel`, null,{
      params: { assignedId, ...options }, // GET 쿼리 파라미터로 전달
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    console.log(res.data);
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};


