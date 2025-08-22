import axios from "axios";

// 🚨 포트 불일치 문제 해결: 백엔드 서버 포트(8080)로 직접 연결
const API_ROOT = "http://localhost:8080";
const REPORT_API = `${API_ROOT}/api/public/report`;
const ANSWER_API = `${API_ROOT}/api/public/report/answer`; // 🎯 올바른 경로로 수정

// 🚨 타임아웃 증가로 연결 안정성 향상
const apiClient = axios.create({
	baseURL: API_ROOT,
	timeout: 30000, // 30초로 증가
	headers: {
		'Content-Type': 'application/json',
	}
});



/**
 * 🔧 에러 처리 함수
 */
const handleError = (error) => {
	console.error("❌ API 에러 상세:", error);
	
	// 백엔드 서버 연결 실패
	if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
		throw new Error("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
	}
	
	// 포트 연결 거부
	if (error.code === 'ERR_CONNECTION_REFUSED') {
		throw new Error("백엔드 서버(포트 8080)에 연결할 수 없습니다. 서버를 실행해주세요.");
	}
	
	// HTTP 에러 응답
	if (error.response?.data?.message) {
		throw new Error(error.response.data.message);
	}
	
	// 기타 에러
	if (error.message) {
		throw error;
	}
	
	throw new Error("알 수 없는 오류가 발생했습니다.");
};

/**
 * 🎯 신고/문의 전체 목록 조회
 * 백엔드에서 이미 완전히 처리된 데이터를 그대로 사용
 */
export const getInquiries = async () => {
	try {
		console.log("🚀 신고/문의 목록 조회 요청");

		const response = await apiClient.get(`${REPORT_API}/list`);
		const data = response.data;
		
		console.log("📋 신고/문의 목록 조회 응답 (총 {}건)", data.length);
		console.log("📋 백엔드 응답 샘플:", data[0]);

		// 🎯 백엔드에서 이미 완전히 처리된 데이터를 단순 매핑
		const convertedData = data.map((report, index) => {
			console.log(`🔍 Report ${index + 1} 분석:`, {
				reportId: report.reportId,
				rStatus: report.rStatus,
				rCate: report.rCate,
				reporter: report.reporter
			});
			
			return {
				reportId: report.reportId || report.id,
				rTitle: report.rTitle || report.title || "제목 없음",
				rContent: report.rContent || report.content || "내용 없음",
				regDate: report.regDate || report.createdAt || new Date().toISOString(),
				rStatus: report.rStatus || "상태 없음", // 🎯 백엔드에서 한국어로 완전 처리됨
				reporter: report.reporter || "COMPANY",
				reporterName: report.reporterName || "신고자 정보 없음",
				reporterType: report.reporterType || "UNKNOWN",
				reporterDisplay: report.reporterDisplay || "알 수 없음",
				rCate: report.rCate || "기타", // 🎯 백엔드에서 한국어로 완전 처리됨
				place: report.place || "장소 정보 없음",
				assignedId: report.assignedId || report.deliveryAssignmentId,
				startAddress: report.startAddress || "주소 정보 없음",
				endAddress: report.endAddress || "주소 정보 없음",
				fileNames: report.fileNames || report.fileName || []
			};
		});

		console.log("✅ 변환된 목록 데이터 (총 {}건)", convertedData.length);
		return convertedData;
		
	} catch (error) {
		console.error("❌ 백엔드 연결 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 신고/문의 상세 조회
 * 백엔드에서 이미 완전히 처리된 데이터를 그대로 사용
 */
export const getInquiryById = async (id) => {
	try {
		console.log("🚀 신고/문의 상세 조회 요청 (ID):", id);
		
		const response = await apiClient.get(`${REPORT_API}/detail?reportId=${id}`);
		const data = response.data;
		
		console.log("📋 신고/문의 상세 조회 응답:", data);

		// 🎯 백엔드에서 이미 완전히 처리된 데이터를 단순 매핑
		const convertedDetail = {
			reportId: data.reportId,
			rTitle: data.rTitle || "제목 없음",
			rContent: data.rContent || "내용 없음",
			regDate: data.regDate || new Date().toISOString(),
			rStatus: data.rStatus || "상태 없음", // 🎯 백엔드에서 한국어로 완전 처리됨
			reporter: data.reporter || "알 수 없음",
			reporterName: data.reporterName || "신고자 정보 없음",
			reporterType: data.reporterType || "UNKNOWN",
			reporterDisplay: data.reporterDisplay || "알 수 없음",
			rCate: data.rCate || "기타", // 🎯 백엔드에서 한국어로 완전 처리됨
			place: data.place || "장소 정보 없음",
			deliveryAssignmentId: data.deliveryAssignmentId,
			startAddress: data.startAddress || "주소 정보 없음",
			endAddress: data.endAddress || "주소 정보 없음",
			fileName: data.fileNames || [] // fileNames로 변경 (백엔드 응답 구조에 맞춤)
		};

		console.log("✅ 변환된 상세 데이터:", convertedDetail);
		return convertedDetail;
		
	} catch (error) {
		console.error("❌ 신고/문의 상세 조회 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 답변 등록
 */
export const submitAnswer = async (reportId, answerContent) => {
	try {
		console.log("🚀 답변 등록 요청:", { reportId, answerContent });
		
		const answerData = {
			reportId: reportId,
			content: answerContent,
			adminId: 1, // 기본 관리자 ID (실제로는 로그인된 사용자 ID 사용)
			regDate: new Date().toISOString()
		};
		
		console.log("📤 전송할 답변 데이터:", answerData);
		
		const response = await apiClient.post(`${ANSWER_API}/register`, answerData);
		console.log("✅ 답변 등록 응답:", response.data);
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 답변 등록 실패:", error);
		console.error("🔍 에러 상세 정보:", {
			message: error.message,
			status: error.response?.status,
			data: error.response?.data,
			config: error.config
		});
		handleError(error);
		throw error; // 에러를 상위로 전파하여 UI에서 처리
	}
};

/**
 * 🎯 답변 목록 조회
 */
export const getAnswers = async (reportId) => {
	try {
		console.log("🚀 답변 목록 조회 요청 (reportId):", reportId);
		
		const response = await apiClient.get(`${ANSWER_API}/list?reportId=${reportId}`);
		console.log("✅ 답변 목록 조회 응답:", response.data);
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 답변 목록 조회 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 특정 신고에 대한 답변 조회 (InquiryDetail에서 사용)
 */
export const getAnswerByReportId = async (reportId) => {
	try {
		console.log("🚀 신고별 답변 조회 요청 (reportId):", reportId);
		
		const response = await apiClient.get(`${ANSWER_API}/list?reportId=${reportId}`);
		console.log("✅ 신고별 답변 조회 응답:", response.data);
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 신고별 답변 조회 실패:", error);
		console.error("🔍 에러 상세 정보:", {
			message: error.message,
			status: error.response?.status,
			data: error.response?.data,
			config: error.config
		});
		handleError(error);
		throw error; // 에러를 상위로 전파하여 UI에서 처리
	}
};

/**
 * 🎯 답변 수정
 */
export const updateAnswer = async (answerId, content) => {
	try {
		console.log("🚀 답변 수정 요청:", { answerId, content });
		
		const response = await apiClient.put(`${ANSWER_API}/${answerId}`, { content });
		console.log("✅ 답변 수정 완료");
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 답변 수정 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 답변 삭제
 */
export const deleteAnswer = async (answerId) => {
	try {
		console.log("🚀 답변 삭제 요청 (answerId):", answerId);
		
		const response = await apiClient.delete(`${ANSWER_API}/${answerId}`);
		console.log("✅ 답변 삭제 완료");
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 답변 삭제 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 신고/문의 삭제
 */
export const deleteInquiry = async (id) => {
	try {
		console.log("🚀 신고/문의 삭제 요청 (ID):", id);
		
		const response = await apiClient.delete(`${REPORT_API}/${id}`);
		console.log("✅ 신고/문의 삭제 완료");
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 신고/문의 삭제 실패:", error);
		handleError(error);
	}
};

/**
 * 🎯 신고/문의 상태 업데이트
 */
export const updateInquiryStatus = async (id, status) => {
	try {
		console.log("🚀 신고/문의 상태 업데이트 요청:", { id, status });
		
		const response = await apiClient.patch(`${REPORT_API}/${id}/status`, { status });
		console.log("✅ 신고/문의 상태 업데이트 완료");
		
		return response.data;
		
	} catch (error) {
		console.error("❌ 신고/문의 상태 업데이트 실패:", error);
		handleError(error);
	}
};

export default {
	getInquiries,
	getInquiryById,
	submitAnswer,
	getAnswers,
	deleteInquiry,
	updateInquiryStatus
};