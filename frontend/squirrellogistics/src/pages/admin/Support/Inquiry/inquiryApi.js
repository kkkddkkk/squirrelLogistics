// src/pages/admin/Support/Inquiry/inquiryApi.js
import axios from "axios";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:8080";
const REPORT_API = `${API_ROOT}/api/public/report`;
const ANSWER_API = `${API_ROOT}/api/public/answers`;

/* ============== 공통 헬퍼 ============== */
const extractData = (response) => {
  if (response.data?.success !== false && response.data?.data !== undefined) {
    // { success:true, data: ... } 형태
    return response.data.data;
  }
  // 그 외(그냥 객체/배열 반환 등)는 그대로 사용
  return response.data;
};

// 상태값을 한국어로 변환
const mapStatus = (status) => {
  if (!status) return "상태 없음";
  const statusStr = status?.name || status;

  if (
    typeof statusStr === "string" &&
    (statusStr.includes("대기") ||
      statusStr.includes("검토") ||
      statusStr.includes("처리") ||
      statusStr.includes("완료") ||
      statusStr.includes("거부") ||
      statusStr.includes("미실행") ||
      statusStr.includes("오류") ||
      statusStr.includes("답변"))
  ) {
    return statusStr;
  }

  switch (statusStr) {
    case "PENDING":
      return "대기 중";
    case "IN_REVIEW":
      return "검토 중";
    case "ACTION_TAKEN":
      return "조치 완료";
    case "COMPLETED":
      return "완료";
    case "REJECTED":
      return "거부됨";
    case "UNEXECUTED":
      return "미실행";
    case "PROCESSING":
      return "처리 중";
    case "ERROR":
      return "오류";
    default:
      return statusStr || "상태 없음";
  }
};

// 카테고리 한국어 변환
const mapCategory = (category) => {
  if (!category) return "기타";
  const categoryStr = category?.name || category;

  if (
    typeof categoryStr === "string" &&
    (categoryStr.includes("서비스") ||
      categoryStr.includes("배송") ||
      categoryStr.includes("결제") ||
      categoryStr.includes("기타"))
  ) {
    return categoryStr;
  }

  switch (categoryStr) {
    case "SERVICE":
      return "서비스";
    case "DELIVERY":
      return "배송";
    case "PAYMENT":
      return "결제";
    case "OTHER":
      return "기타";
    default:
      return categoryStr || "기타";
  }
};

// 공통 에러 처리
const handleError = (error) => {
  console.error("API 에러 상세:", error);

  if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
    throw new Error("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
  }

  if (error.code === "ERR_CONNECTION_REFUSED") {
    throw new Error("백엔드 서버(포트 8080)에 연결할 수 없습니다. 서버를 실행해주세요.");
  }

  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }

  if (error.message) {
    throw error;
  }

  throw new Error("알 수 없는 오류가 발생했습니다.");
};

/* ============== 목록 조회 ============== */
// 신고/문의 전체 목록 조회 (Company Report 데이터)
export const getInquiries = async () => {
  try {
    console.log("신고/문의 목록 조회 요청");
    const response = await axios.get(`${REPORT_API}/list`);
    const raw = extractData(response); // 배열 또는 객체 배열

    const converted = (raw || []).map((report) => {
      const convertedOne = {
        reportId: report.reportId ?? report.id,
        rTitle: report.rTitle ?? report.title ?? "제목 없음",
        rContent: report.rContent ?? report.content ?? "내용 없음",
        regDate: report.regDate ?? report.createdAt ?? new Date().toISOString(),
        rStatus: mapStatus(report.rStatus ?? report.status),
        reporter: report.reporter ?? "COMPANY",
        reporterName: report.reporterName ?? "신고자 정보 없음",
        reporterType: report.reporterType ?? "UNKNOWN",
        reporterDisplay: report.reporterDisplay ?? "알 수 없음",
        rCate: mapCategory(report.rCate ?? report.category),
        place: report.place ?? "장소 정보 없음",
        assignedId: report.assignedId ?? report.deliveryId ?? report.deliveryAssignmentId,
        startAddress: report.startAddress ?? "주소 정보 없음",
        endAddress: report.endAddress ?? "주소 정보 없음",
        fileNames: report.fileNames ?? report.fileName ?? [],
      };
      return convertedOne;
    });

    return converted;
  } catch (error) {
    // 네트워크 계열 에러일 때 로컬스토리지 폴백 시도
    console.warn("백엔드 연결 실패, LocalStorage 폴백 시도:", error?.message);
    try {
      return getInquiriesFromLocalStorage();
    } catch (e) {
      console.error("LocalStorage 폴백도 실패:", e);
      handleError(error); // 원래 에러 처리
    }
  }
};

// LocalStorage 폴백 데이터 (목록)
const getInquiriesFromLocalStorage = () => {
  const stored = localStorage.getItem("inquiries");
  if (stored) return JSON.parse(stored);

  const sample = [
    {
      reportId: 1,
      rTitle: "배송 지연 문의",
      rContent: "주문한 상품이 예상보다 늦게 도착합니다. 확인 부탁드립니다.",
      regDate: new Date().toISOString(),
      rStatus: "대기 중",
      reporter: "COMPANY",
      rCate: "배송",
      assignedId: 15,
      startAddress: "서울시 강남구 테헤란로 123",
      endAddress: "서울시 서초구 서초대로 456",
      fileNames: [],
    },
    {
      reportId: 2,
      rTitle: "상품 파손 신고",
      rContent: "택배 상자에 구멍이 뚫려있고 상품이 손상되었습니다. 조치 부탁드립니다.",
      regDate: new Date(Date.now() - 86400000).toISOString(),
      rStatus: "검토 중",
      reporter: "COMPANY",
      rCate: "서비스",
      assignedId: 16,
      startAddress: "부산시 해운대구 해운대로 789",
      endAddress: "부산시 동래구 동래로 101",
      fileNames: ["damage1.jpg", "damage2.jpg"],
    },
  ];
  localStorage.setItem("inquiries", JSON.stringify(sample));
  return sample;
};

/* ============== 상세 조회 ============== */
// 신고/문의 상세 조회 (Company Report 상세 데이터)
export const getInquiryById = async (id) => {
  try {
    console.log("신고/문의 상세 조회 요청 (ID):", id);

    // params 방식으로 호출 (백엔드 구현 차이 대응)
    const response = await axios.get(`${REPORT_API}`, { params: { reportId: id } });
    const data = extractData(response) ?? {};

    const convertedDetail = {
      reportId: data.reportId ?? data.id,
      rTitle: data.rTitle ?? data.rtitle ?? data.title ?? "제목 없음",
      rContent: data.rContent ?? data.rcontent ?? data.content ?? "내용 없음",
      regDate: data.regDate ?? data.createdAt ?? new Date().toISOString(),
      rStatus: mapStatus(data.rStatus ?? data.rstatus ?? data.status),
      reporter: data.reporter ?? "COMPANY",
      rCate: mapCategory(data.rCate ?? data.rcate ?? data.category),
      place: data.place ?? "장소 정보 없음",
      assignedId: data.assignedId ?? data.deliveryId ?? data.deliveryAssignmentId,
      startAddress: data.startAddress ?? "주소 정보 없음",
      endAddress: data.endAddress ?? "주소 정보 없음",
      fileName: data.fileName ?? data.fileNames ?? [],
    };

    return convertedDetail;
  } catch (error) {
    console.warn("상세 조회 실패, LocalStorage 폴백 시도:", error?.message);
    try {
      return getInquiryByIdFromLocalStorage(id);
    } catch (e) {
      console.error("LocalStorage 상세 폴백도 실패:", e);
      handleError(error);
    }
  }
};

// LocalStorage 폴백 데이터 (상세)
const getInquiryByIdFromLocalStorage = (id) => {
  const stored = localStorage.getItem("inquiries");
  if (stored) {
    const list = JSON.parse(stored);
    const found = list.find((v) => String(v.reportId) === String(id));
    if (found) {
      return {
        fileName: found.fileNames ?? [],
        rTitle: found.rTitle ?? "",
        rContent: found.rContent ?? "",
        regDate: found.regDate ?? new Date().toISOString(),
        reporter: found.reporter ?? "",
      };
    }
  }
  return {
    fileName: [],
    rTitle: "데이터를 찾을 수 없습니다",
    rContent: "요청하신 신고/문의 정보를 찾을 수 없습니다.",
    regDate: new Date().toISOString(),
    reporter: "UNKNOWN",
  };
};

/* ============== 답변 API ============== */
// 답변 등록
export const submitAnswer = async (reportId, answerContent) => {
  try {
    console.log("답변 등록 요청:", { reportId, answerContent });

    const answerData = { reportId, content: answerContent };
    const response = await axios.post(ANSWER_API, answerData);
    const data = extractData(response);

    console.log("답변 등록 응답:", data);
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 답변 조회
export const getAnswerByReportId = async (reportId) => {
  try {
    console.log("답변 조회 요청 (reportId):", reportId);

    const response = await axios.get(`${ANSWER_API}/report/${reportId}`);
    const data = extractData(response);

    console.log("답변 조회 응답:", data);
    return data;
  } catch (error) {
    if (error.response?.status === 500) {
      console.log("답변이 없거나 조회 실패, null 반환");
      return null;
    }
    handleError(error);
  }
};

// 답변 수정
export const updateAnswer = async (answerId, answerContent) => {
  try {
    console.log("답변 수정 요청:", { answerId, answerContent });

    const answerData = { reportId: null, content: answerContent };
    const response = await axios.put(`${ANSWER_API}/${answerId}`, answerData);
    const data = extractData(response);

    console.log("답변 수정 응답:", data);
    return data;
  } catch (error) {
    handleError(error);
  }
};

// 답변 삭제
export const deleteAnswer = async (answerId) => {
  try {
    console.log("답변 삭제 요청 (answerId):", answerId);

    const response = await axios.delete(`${ANSWER_API}/${answerId}`);
    const data = extractData(response);

    console.log("답변 삭제 응답:", data);
    return data;
  } catch (error) {
    handleError(error);
  }
};
