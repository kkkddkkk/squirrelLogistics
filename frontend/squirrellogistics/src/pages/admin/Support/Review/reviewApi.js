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

// 리뷰 상세 조회
export const getReviewById = async (id) => {
  try {
    console.log("리뷰 상세 조회 요청 (ID):", id);
    const response = await axios.get(`${REVIEW_API}/detail?reviewId=${id}`);
    console.log("리뷰 상세 조회 응답:", response.data);
    return response.data; // Map<String, Object> 직접 반환
  } catch (error) {
    handleError(error);
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
