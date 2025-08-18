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

// 기사 프로필 조회
export const getDriverProfile = async (driverId) => {
  try {
    const response = await driverApi.get(`/profile?driverId=${driverId}`);
    return response.data;
  } catch (error) {
    console.error("기사 프로필 조회 실패:", error);
    throw error;
  }
};

// 기사 프로필 수정
export const updateDriverProfile = async (driverId, profileData) => {
  try {
    const response = await driverApi.put(
      `/profile?driverId=${driverId}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("기사 프로필 수정 실패:", error);
    throw error;
  }
};

// 비밀번호 확인
export const verifyPassword = async (driverId, password) => {
  try {
    const response = await driverApi.post(
      `/auth/verify-password?driverId=${driverId}&password=${password}`
    );
    return response.data;
  } catch (error) {
    console.error("비밀번호 확인 실패:", error);
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (
  driverId,
  currentPassword,
  newPassword
) => {
  try {
    const response = await driverApi.put(
      `/auth/password?driverId=${driverId}&currentPassword=${currentPassword}&newPassword=${newPassword}`
    );
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    throw error;
  }
};

// 회원 탈퇴
export const deleteAccount = async (driverId) => {
  try {
    const response = await driverApi.delete(
      `/auth/account?driverId=${driverId}`
    );
    return response.data;
  } catch (error) {
    console.error("회원 탈퇴 실패:", error);
    throw error;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (driverId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await driverApi.post(
      `/profile/image?driverId=${driverId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("프로필 이미지 업로드 실패:", error);
    throw error;
  }
};

export default driverApi;
