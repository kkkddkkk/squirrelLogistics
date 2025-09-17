import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080/api";

export const getBannerList = async ({ accessToken }) => {
  try {
    const res = await axios.get(`${API_SERVER_HOST}/banner/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
      },
    });
    return res.data; // 필요하면 반환
  } catch (err) {
    console.error(err); // res.data.err → err 자체에 에러 정보 있음
  }
};