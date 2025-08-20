import axios from 'axios';

// API 기본 설정
const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const REVIEW_API = `${API_ROOT}/api/public/review`;

// API 응답 데이터 추출 헬퍼
const extractData = (response) => {
  if (response.data && response.data.success !== undefined) {
    return response.data.data;
  }
  return response.data;
};

// API 에러 처리 헬퍼
const handleError = (error) => {
  console.error('API 호출 실패:', error);
  if (error.response) {
    throw new Error(error.response.data?.message || '서버 오류가 발생했습니다.');
  } else if (error.request) {
    throw new Error('서버에 연결할 수 없습니다.');
  } else {
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
};

// 리뷰 목록 조회 (전체)
export const getReviews = async () => {
  try {
    console.log("리뷰 목록 조회 요청");
    const response = await axios.get(`${REVIEW_API}/list`);
    console.log("리뷰 목록 조회 응답:", response.data);
    return response.data; // List<Map<String, Object>> 직접 반환
  } catch (error) {
    handleError(error);
  }
};

// 신고된 리뷰 목록 조회
export const getReportedReviews = async () => {
  try {
    console.log("신고된 리뷰 목록 조회 요청");
    const response = await axios.get(`${REVIEW_API}/reported`);
    console.log("신고된 리뷰 목록 조회 응답:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 숨김 처리된 리뷰 목록 조회
export const getHiddenReviews = async () => {
  try {
    console.log("숨김 처리된 리뷰 목록 조회 요청");
    const response = await axios.get(`${REVIEW_API}/hidden`);
    console.log("숨김 처리된 리뷰 목록 조회 응답:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 상세 조회
export const getReviewById = async (id) => {
  try {
    console.log("리뷰 상세 조회 요청 (ID):", id);
    const response = await axios.get(`${REVIEW_API}?reviewId=${id}`);
    console.log("리뷰 상세 조회 응답:", response.data);
    return response.data; // Map<String, Object> 직접 반환
  } catch (error) {
    console.error("백엔드 연결 실패, LocalStorage 폴백 사용:", error);
    
    // 백엔드 연결 실패 시 LocalStorage에서 데이터 로드
    try {
      const fallbackData = getReviewByIdFromLocalStorage(id);
      console.log("LocalStorage에서 로드된 리뷰 데이터:", fallbackData);
      return fallbackData;
    } catch (fallbackError) {
      console.error("LocalStorage 폴백도 실패:", fallbackError);
      throw error; // 원래 에러를 다시 던짐
    }
  }
};

// LocalStorage에서 리뷰 상세 데이터 로드 (폴백용)
const getReviewByIdFromLocalStorage = (id) => {
  try {
    const stored = localStorage.getItem('reviews');
    if (stored) {
      const reviews = JSON.parse(stored);
      const review = reviews.find(item => item.reviewId == id);
      
      if (review) {
        return review;
      }
    }
    
    // 데이터가 없으면 기본값 반환
    return {
      reviewId: id,
      rating: 1,
      content: "너무 졸려요......죽고싶어요",
      status: "HIDDEN",
      regDate: "2025-08-18T01:01:00.000Z",
      assignedId: 2,
      deliveryStatus: "COMPLETED"
    };
    
  } catch (error) {
    console.error("LocalStorage 리뷰 데이터 로드 실패:", error);
    return {
      reviewId: id,
      rating: 1,
      content: "데이터 로드 중 오류가 발생했습니다.",
      status: "ERROR",
      regDate: new Date().toISOString(),
      assignedId: 0,
      deliveryStatus: "UNKNOWN"
    };
  }
};

// 리뷰 승인
export const approveReview = async (reviewId) => {
  try {
    console.log("리뷰 승인 요청 (ID):", reviewId);
    const response = await axios.put(`${REVIEW_API}/${reviewId}/approve`);
    console.log("리뷰 승인 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 숨김 처리
export const hideReview = async (reviewId, reason = "운영 정책 위반") => {
  try {
    console.log("리뷰 숨김 처리 요청 (ID):", reviewId, "사유:", reason);
    const response = await axios.put(`${REVIEW_API}/${reviewId}/hide`, { reason });
    console.log("리뷰 숨김 처리 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 복원
export const restoreReview = async (reviewId) => {
  try {
    console.log("리뷰 복원 요청 (ID):", reviewId);
    const response = await axios.put(`${REVIEW_API}/${reviewId}/restore`);
    console.log("리뷰 복원 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 반려
export const rejectReview = async (reviewId, reason) => {
  try {
    console.log("리뷰 반려 요청 (ID):", reviewId, "사유:", reason);
    const response = await axios.put(`${REVIEW_API}/${reviewId}/reject`, { reason });
    console.log("리뷰 반려 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 생성
export const createReview = async (reviewData) => {
  try {
    console.log("리뷰 생성 요청:", reviewData);
    const response = await axios.post(REVIEW_API, reviewData);
    console.log("리뷰 생성 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 수정
export const updateReview = async (id, reviewData) => {
  try {
    console.log("리뷰 수정 요청 (ID):", id, reviewData);
    const response = await axios.put(`${REVIEW_API}/${id}`, reviewData);
    console.log("리뷰 수정 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 삭제
export const deleteReview = async (id) => {
  try {
    console.log("리뷰 삭제 요청 (ID):", id);
    const response = await axios.delete(`${REVIEW_API}/${id}`);
    console.log("리뷰 삭제 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};

// 리뷰 신고
export const reportReview = async (reviewId, reason) => {
  try {
    console.log("리뷰 신고 요청 (ID):", reviewId, "사유:", reason);
    const response = await axios.post(`${REVIEW_API}/${reviewId}/report`, { reason });
    console.log("리뷰 신고 응답:", response.data);
    return extractData(response);
  } catch (error) {
    handleError(error);
  }
};
