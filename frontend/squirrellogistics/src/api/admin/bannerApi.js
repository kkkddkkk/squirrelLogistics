import axios from "axios";
import API_SERVER_HOST from "../apiServerHost";

// export const API_SERVER_HOST = "http://localhost:8080/api";

export const getBannerList = async ({ accessToken }) => {
  console.log(process.env.REACT_APP_API_BASE);
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/banner/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getOneBanner = async ({ accessToken, bannerId }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/banner?bannerId=${bannerId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const createBanner = async ({ accessToken, formData }) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/banner`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      }
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const modifyBanner = async ({ accessToken, formData }) => {
  try {
    const res = await axios.post(`${API_SERVER_HOST}/banner/modify`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      }
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const deleteBanner = async ({ accessToken, bannerId }) => {
  try {
    const res = await axios.delete(`${API_SERVER_HOST}/banner?bannerId=${bannerId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};

export const getPublicBanners = async () => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/public/banner/list`, {
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};