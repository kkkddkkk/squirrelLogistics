// src/api/cars.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// axios 인스턴스 생성
const carsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/driver`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 자동 추가
carsApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 시 자동 로그아웃
carsApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("토큰이 만료되었습니다. 로그인 페이지로 이동합니다.");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function fetchCars({
  page = 1,
  size = 10,
  keyword = "",
  status = "",
}) {
  try {
    // 실제 API 호출
    const response = await carsApi.get("/cars", {
      params: { page, size, keyword, status },
    });
    return response.data;
  } catch (error) {
    console.error("차량 목록 조회 실패:", error);
    console.error("에러 응답:", error.response?.data);
    console.error("에러 상태:", error.response?.status);
    // 에러 시 빈 배열 반환 (DriverProfile에서 직접 사용)
    return [];
  }
}

export async function fetchCarById(id) {
  try {
    const response = await carsApi.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error("차량 상세 조회 실패:", error);
    throw error;
  }
}

export async function createCar(carData) {
  try {
    const response = await carsApi.post("/cars", carData);
    return response.data;
  } catch (error) {
    console.error("차량 생성 실패:", error);
    throw error;
  }
}

export async function updateCar(id, carData) {
  try {
    const response = await carsApi.put(`/cars/${id}`, carData);
    return response.data;
  } catch (error) {
    console.error("차량 수정 실패:", error);
    throw error;
  }
}

export async function deleteCar(id) {
  try {
    const response = await carsApi.delete(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error("차량 삭제 실패:", error);
    throw error;
  }
}
