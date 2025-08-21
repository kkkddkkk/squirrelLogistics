import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// axios 인스턴스 생성
const driverApi = axios.create({
  baseURL: `${API_BASE_URL}/api/driver`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 추가
driverApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
driverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 기사 프로필 조회 (accessToken 사용)
export const getDriverProfile = async () => {
  try {
    const response = await driverApi.get(`/profile`);
    return response.data;
  } catch (error) {
    console.error("기사 프로필 조회 실패:", error);
    throw error;
  }
};

// 기사 프로필 수정
export const updateDriverProfile = async (profileData) => {
  try {
    const response = await driverApi.put(`/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("기사 프로필 수정 실패:", error);
    throw error;
  }
};

// 비밀번호 확인
export const verifyPassword = async (password) => {
  try {
    const response = await driverApi.post(
      `/auth/verify-password?password=${encodeURIComponent(password)}`
    );
    return response.data;
  } catch (error) {
    console.error("비밀번호 확인 실패:", error);
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await driverApi.put(
      `/auth/password?currentPassword=${currentPassword}&newPassword=${newPassword}`
    );
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    throw error;
  }
};

// 회원 탈퇴
export const deleteAccount = async () => {
  try {
    const response = await driverApi.delete(`/auth/account`);
    return response.data;
  } catch (error) {
    console.error("회원 탈퇴 실패:", error);
    throw error;
  }
};

// 기사 차량 목록 조회
export const getDriverCars = async () => {
  try {
    const response = await driverApi.get(`/cars`);
    return response.data;
  } catch (error) {
    console.error("기사 차량 목록 조회 실패:", error);
    throw error;
  }
};

// 차량 추가
export const addCar = async (carData) => {
  try {
    const response = await driverApi.post(`/cars`, carData);
    return response.data;
  } catch (error) {
    console.error("차량 추가 실패:", error);
    throw error;
  }
};

// 차량 수정
export const updateCar = async (carId, carData) => {
  try {
    const response = await driverApi.put(`/cars/${carId}`, carData);
    return response.data;
  } catch (error) {
    console.error("차량 수정 실패:", error);
    throw error;
  }
};

// 차량 삭제
export const deleteCar = async (carId) => {
  try {
    const response = await driverApi.delete(`/cars/${carId}`);
    return response.data;
  } catch (error) {
    console.error("차량 삭제 실패:", error);
    throw error;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await driverApi.post(`/profile/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("프로필 이미지 업로드 실패:", error);
    throw error;
  }
};

// 프로필 이미지 삭제
export const deleteProfileImage = async () => {
  try {
    const response = await driverApi.delete(`/profile/image`);
    return response.data;
  } catch (error) {
    console.error("프로필 이미지 삭제 실패:", error);
    throw error;
  }
};

export default driverApi;
