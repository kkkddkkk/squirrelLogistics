import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api";

export const getReportDashBoard = async ({ accessToken }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/admin/report/dashboard`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getReportlist = async ({ accessToken, page, size, status, cate, keyword }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/admin/report/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
      params: {
        page,
        size,
        status,
        cate,
        keyword,
      }
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getDetailReport = async ({ accessToken, reportId }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/admin/report?reportId=${reportId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getRank = async ({ accessToken }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/admin/report/rank`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getMonthly = async ({ accessToken, year }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/admin/report/monthly`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
      params: {
        year
      }
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const createAnswer = async ({ accessToken, reportId, form }) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/admin/answer?reportId=${reportId}`, {
      ...form
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const updateAnswer = async ({ accessToken, reportId, form }) => {
  try {
    const res = await axios.put(`${API_SERVER_HOST}/admin/answer?reportId=${reportId}`, {
      ...form
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};


