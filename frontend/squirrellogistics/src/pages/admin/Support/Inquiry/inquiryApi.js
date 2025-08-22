import axios from "axios";

const API_ROOT = process.env.REACT_APP_API_ROOT || "http://localhost:8080";
const REPORT_API = `${API_ROOT}/api/public/report`;
const ANSWER_API = `${API_ROOT}/api/public/answers`;

// 헬퍼 함수들
const extractData = (response) => {
	if (response.data?.success) {
		return response.data.data;
	}
	throw new Error(response.data?.message || "알 수 없는 오류가 발생했습니다.");
};

// 상태값을 한국어로 변환하는 함수
const mapStatus = (status) => {
  if (!status) return "상태 없음";
  
  // Enum 객체에서 name 추출 또는 문자열 처리
  const statusStr = status?.name || status;
  
  // 이미 한국어인 경우 그대로 반환
  if (typeof statusStr === 'string' && (
    statusStr.includes('대기') || 
    statusStr.includes('검토') || 
    statusStr.includes('처리') || 
    statusStr.includes('완료') || 
    statusStr.includes('거부') || 
    statusStr.includes('미실행') || 
    statusStr.includes('오류') ||
    statusStr.includes('답변')
  )) {
    return statusStr;
  }
  
  // 영문 Enum을 한국어로 변환
  switch (statusStr) {
    case 'PENDING': return '대기 중';
    case 'IN_REVIEW': return '검토 중';
    case 'ACTION_TAKEN': return '조치 완료';
    case 'COMPLETED': return '완료';
    case 'REJECTED': return '거부됨';
    case 'UNEXECUTED': return '미실행';
    case 'PROCESSING': return '처리 중';
    case 'ERROR': return '오류';
    default: return statusStr || '상태 없음';
  }
};

// 카테고리를 한국어로 변환하는 함수
const mapCategory = (category) => {
  if (!category) return "기타";
  
  // Enum 객체에서 name 추출 또는 문자열 처리
  const categoryStr = category?.name || category;
  
  // 이미 한국어인 경우 그대로 반환
  if (typeof categoryStr === 'string' && (
    categoryStr.includes('서비스') || 
    categoryStr.includes('배송') || 
    categoryStr.includes('결제') || 
    categoryStr.includes('기타')
  )) {
    return categoryStr;
  }
  
  // 영문 Enum을 한국어로 변환
  switch (categoryStr) {
    case 'SERVICE': return '서비스';
    case 'DELIVERY': return '배송';
    case 'PAYMENT': return '결제';
    case 'OTHER': return '기타';
    default: return categoryStr || '기타';
  }
};

// 에러 처리 함수
const handleError = (error) => {
	console.error("API 에러 상세:", error);
	
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

// 신고/문의 전체 목록 조회 (Company Report 데이터)
export const getInquiries = async () => {
<<<<<<< Updated upstream
  try {
    console.log("Company Report 데이터 조회 요청");

    // Company Report 목록 조회
    const response = await axios.get(`${REPORT_API}/list`);
    const data = response.data;
    console.log("Company Report 목록 조회 응답:", data);

    // Company Report 데이터를 Admin Inquiry 형태로 변환
    const convertedData = data.map(report => ({
      reportId: report.reportId || report.id,
      rTitle: report.rTitle || report.title || "제목 없음",
      rContent: report.rContent || report.content || "내용 없음",
      regDate: report.regDate || report.createdAt || new Date().toISOString(),
      rStatus: report.rStatus || report.status || "PENDING",
      reporter: report.reporter || "COMPANY",
      rCate: report.rCate || report.category || "",
      assignedId: report.assignedId || report.deliveryId,
      startAddress: report.startAddress || "주소 정보 없음",
      endAddress: report.endAddress || "주소 정보 없음",
      fileNames: report.fileNames || report.fileName || []
    }));

    console.log("변환된 Inquiry 데이터:", convertedData);
    return convertedData;

  } catch (error) {
    console.error("백엔드 연결 실패, LocalStorage 폴백 사용:", error);
    
    // 백엔드 연결 실패 시 LocalStorage에서 데이터 로드
    try {
      const fallbackData = getInquiriesFromLocalStorage();
      console.log("LocalStorage에서 로드된 데이터:", fallbackData);
      return fallbackData;
    } catch (fallbackError) {
      console.error("LocalStorage 폴백도 실패:", fallbackError);
      throw error; // 원래 에러를 다시 던짐
    }
  }
};

// LocalStorage에서 신고/문의 목록 로드 (폴백용)
const getInquiriesFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem('inquiries');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // LocalStorage에 데이터가 없으면 Company Report 샘플 데이터 생성
    const sampleData = [
      {
        reportId: 1,
        rTitle: "배송 지연 문의",
        rContent: "주문한 상품이 예상보다 늦게 도착합니다. 확인 부탁드립니다.",
        regDate: new Date().toISOString(),
        rStatus: "PENDING",
        reporter: "COMPANY",
        rCate: "배송",
        assignedId: 15,
        startAddress: "서울시 강남구 테헤란로 123",
        endAddress: "서울시 서초구 서초대로 456",
        fileNames: []
      },
      {
        reportId: 2,
        rTitle: "상품 파손 신고",
        rContent: "택배 상자에 구멍이 뚫려있고 상품이 손상되었습니다. 조치 부탁드립니다.",
        regDate: new Date(Date.now() - 86400000).toISOString(),
        rStatus: "IN_REVIEW",
        reporter: "COMPANY",
        rCate: "상품",
        assignedId: 16,
        startAddress: "부산시 해운대구 해운대로 789",
        endAddress: "부산시 동래구 동래로 101",
        fileNames: ["damage1.jpg", "damage2.jpg"]
      }
    ];
    
    // LocalStorage에 저장
    localStorage.setItem('inquiries', JSON.stringify(sampleData));
    return sampleData;
    
  } catch (error) {
    console.error("LocalStorage 데이터 로드 실패:", error);
    return [];
  }
=======
	try {
		console.log("신고/문의 목록 조회 요청");

		const response = await axios.get(`${REPORT_API}/list`);
		// ReportController는 List<Map<String, Object>>를 직접 반환
		const data = response.data;
		console.log("신고/문의 목록 조회 응답:", data);

		// Company Report 데이터를 Admin Inquiry 형태로 변환
		const convertedData = data.map(report => {
			console.log("=== 개별 Report 데이터 분석 ===");
			console.log("원본 report 객체:", report);
			console.log("rStatus 원본값:", report.rStatus);
			console.log("rStatus 타입:", typeof report.rStatus);
			console.log("rStatus.name:", report.rStatus?.name);
			console.log("rCate 원본값:", report.rCate);
			console.log("rCate 타입:", typeof report.rCate);
			console.log("rCate.name:", report.rCate?.name);
			console.log("================================");
			
			const converted = {
				reportId: report.reportId || report.id,
				rTitle: report.rTitle || report.title || "제목 없음",
				rContent: report.rContent || report.content || "내용 없음",
				regDate: report.regDate || report.createdAt || new Date().toISOString(),
				rStatus: mapStatus(report.rStatus), // 백엔드에서 이미 한국어로 변환됨
				reporter: report.reporter || "COMPANY",
				reporterName: report.reporterName || "신고자 정보 없음",
				reporterType: report.reporterType || "UNKNOWN",
				reporterDisplay: report.reporterDisplay || "알 수 없음",
				rCate: mapCategory(report.rCate), // 백엔드에서 이미 한국어로 변환됨
				place: report.place || "장소 정보 없음",
				assignedId: report.assignedId || report.deliveryId,
				startAddress: report.startAddress || "주소 정보 없음",
				endAddress: report.endAddress || "주소 정보 없음",
				fileNames: report.fileNames || report.fileName || []
			};
			
			console.log("변환된 데이터:", converted);
			return converted;
		});

		return convertedData;
	} catch (error) {
		console.error("백엔드 연결 실패:", error);
		handleError(error);
	}
>>>>>>> Stashed changes
};

// 신고/문의 상세 조회 (Company Report 상세 데이터)
export const getInquiryById = async (id) => {
<<<<<<< Updated upstream
  try {
    console.log("Company Report 상세 조회 요청 (ID):", id);

    // Company Report 상세 조회
    const response = await axios.get(`${REPORT_API}`, {
      params: { reportId: id }
    });
    
    const reportData = response.data;
    console.log("Company Report 상세 조회 응답:", reportData);

    // Company Report 데이터를 Admin Inquiry 형태로 변환
    const convertedData = {
      reportId: reportData.reportId || reportData.id,
      rTitle: reportData.rTitle || reportData.title || "제목 없음",
      rContent: reportData.rContent || reportData.content || "내용 없음",
      regDate: reportData.regDate || reportData.createdAt || new Date().toISOString(),
      rStatus: reportData.rStatus || reportData.status || "PENDING",
      reporter: reportData.reporter || "COMPANY",
      rCate: reportData.rCate || reportData.category || "",
      assignedId: reportData.assignedId || reportData.deliveryId,
      startAddress: reportData.startAddress || "주소 정보 없음",
      endAddress: reportData.endAddress || "주소 정보 없음",
      fileNames: reportData.fileNames || reportData.fileName || []
    };

    console.log("변환된 Inquiry 상세 데이터:", convertedData);
    return convertedData;

  } catch (error) {
    console.error("백엔드 연결 실패, LocalStorage 폴백 사용:", error);
    
    // 백엔드 연결 실패 시 LocalStorage에서 데이터 로드
    try {
      const fallbackData = getInquiryByIdFromLocalStorage(id);
      console.log("LocalStorage에서 로드된 상세 데이터:", fallbackData);
      return fallbackData;
    } catch (fallbackError) {
      console.error("LocalStorage 폴백도 실패:", fallbackError);
      throw error; // 원래 에러를 다시 던짐
    }
  }
};

// LocalStorage에서 신고/문의 상세 데이터 로드 (폴백용)
const getInquiryByIdFromLocalStorage = (id) => {
  try {
    const stored = localStorage.getItem('inquiries');
    if (stored) {
      const inquiries = JSON.parse(stored);
      const inquiry = inquiries.find(item => item.reportId == id);
      
      if (inquiry) {
        // ReportSlimResponseDTO 형식으로 변환
        return {
          fileName: inquiry.fileNames || [],
          rTitle: inquiry.rTitle || "",
          rContent: inquiry.rContent || "",
          regDate: inquiry.regDate,
          reporter: inquiry.reporter || ""
        };
      }
    }
    
    // 데이터가 없으면 기본값 반환
    return {
      fileName: [],
      rTitle: "데이터를 찾을 수 없습니다",
      rContent: "요청하신 신고/문의 정보를 찾을 수 없습니다.",
      regDate: new Date().toISOString(),
      reporter: "UNKNOWN"
    };
    
  } catch (error) {
    console.error("LocalStorage 상세 데이터 로드 실패:", error);
    return {
      fileName: [],
      rTitle: "오류 발생",
      rContent: "데이터 로드 중 오류가 발생했습니다.",
      regDate: new Date().toISOString(),
      reporter: "ERROR"
    };
  }
=======
	try {
		console.log("신고/문의 상세 조회 요청 (ID):", id);
		
		const response = await axios.get(`${REPORT_API}?reportId=${id}`);
		console.log("신고/문의 상세 조회 응답:", response.data);
		
		const data = response.data;
		
		// 백엔드에서 이미 답변 여부를 확인하고 한국어 상태값을 제공하므로
		// 복잡한 변환 로직이 필요 없습니다.
		const convertedDetail = {
			reportId: data.reportId,
			rTitle: data.rtitle || data.rTitle || "제목 없음", // 백엔드 응답 구조에 맞춤
			rContent: data.rcontent || data.rContent || "내용 없음", // 백엔드 응답 구조에 맞춤
			regDate: data.regDate || new Date().toISOString(),
			rStatus: data.rstatus || data.rStatus || "상태 없음", // 백엔드 응답 구조에 맞춤
			reporter: data.reporter || "알 수 없음",
			rCate: data.rcate || data.rCate || "기타", // 백엔드 응답 구조에 맞춤
			place: data.place || "장소 정보 없음",
			deliveryAssignmentId: data.deliveryAssignmentId,
			fileName: data.fileName || data.fileNames || [] // 백엔드 응답 구조에 맞춤
		};

		console.log("변환된 상세 데이터:", convertedDetail);
		return convertedDetail;
		
	} catch (error) {
		console.error("신고/문의 상세 조회 실패:", error);
		handleError(error);
	}
>>>>>>> Stashed changes
};

// 답변 등록
export const submitAnswer = async (reportId, answerContent) => {
	try {
		console.log("답변 등록 요청:", { reportId, answerContent });
		
		const answerData = {
			reportId: reportId,
			content: answerContent
		};
		
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
		// 500 에러가 발생하면 답변이 없는 것으로 처리
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
		
		const answerData = {
			reportId: null, // 수정 시에는 불필요
			content: answerContent
		};
		
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
