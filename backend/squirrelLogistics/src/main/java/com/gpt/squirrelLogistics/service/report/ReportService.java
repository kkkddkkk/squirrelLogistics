package com.gpt.squirrelLogistics.service.report;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.reportImage.ReportImageRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.reportImage.ReportImage;
import com.gpt.squirrelLogistics.entity.answer.Answer;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.repository.answer.AnswerRepository;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class ReportService {

	private final ReportRepository reportRepository;
	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final ReportImageRepository reportImageRepository;
	private final AnswerRepository answerRepository;

	// 신고리스트
	public List<Map<String, Object>> reportList() {
		List<Report> reports = reportRepository.findAll();
		
		List<Map<String, Object>> result = reports.stream().map(report -> {
			Map<String, Object> map = new HashMap<>();
			
			try {
				// 기본 정보 설정
				map.put("reportId", report.getReportId());
				map.put("rTitle", report.getRTitle() != null ? report.getRTitle() : "");
				map.put("rContent", report.getRContent() != null ? report.getRContent() : "");
				map.put("regDate", report.getRegDate() != null ? report.getRegDate() : LocalDateTime.now());
				
				// 답변 여부 확인하여 상태값 동적 설정
				String finalStatus = "대기 중"; // 기본값
				if (report.getRStatus() != null) {
					String originalStatus = report.getRStatus().name();
					
					// 답변 여부 확인
					try {
						long answerCount = answerRepository.countByReportId(report.getReportId());
						boolean hasAnswer = answerCount > 0;
						
						if (hasAnswer) {
							finalStatus = "답변 완료";
						} else {
							// 원본 상태값을 한국어로 변환
							switch (originalStatus) {
								case "PENDING":
									finalStatus = "대기 중";
									break;
								case "IN_REVIEW":
									finalStatus = "검토 중";
									break;
								case "ACTION_TAKEN":
									finalStatus = "조치 완료";
									break;
								case "COMPLETED":
									finalStatus = "완료";
									break;
								case "REJECTED":
									finalStatus = "거부됨";
									break;
								case "UNEXECUTED":
									finalStatus = "미실행";
									break;
								case "PROCESSING":
									finalStatus = "처리 중";
									break;
								case "ERROR":
									finalStatus = "오류";
									break;
								default:
									finalStatus = originalStatus;
							}
						}
					} catch (Exception e) {
						log.error("답변 상태 확인 실패: {}", e.getMessage());
						finalStatus = "대기 중";
					}
				}
				map.put("rStatus", finalStatus);
				
				// reporter 필드 안전하게 처리
				String reporterValue = "COMPANY"; // 기본값
				if (report.getReporter() != null) {
					try {
						reporterValue = report.getReporter().name();
					} catch (Exception e) {
						log.error("Reporter Enum 변환 실패: {}", e.getMessage());
						reporterValue = "COMPANY";
					}
				}
				map.put("reporter", reporterValue);
				
				map.put("rCate", report.getRCate() != null ? report.getRCate().name() : "");
				map.put("place", report.getPlace() != null ? report.getPlace() : "");
				
				// 신고자 타입별 정보 설정
				if (reporterValue != null && !reporterValue.isEmpty()) {
					if ("COMPANY".equals(reporterValue)) {
						// Company 신고자
						map.put("reporterName", "회사 사용자");
						map.put("reporterType", "COMPANY");
						map.put("reporterDisplay", "회사");
					} else if ("DRIVER".equals(reporterValue)) {
						// Driver 신고자
						map.put("reporterName", "기사");
						map.put("reporterType", "DRIVER");
						map.put("reporterDisplay", "기사");
					} else if ("SYSTEM".equals(reporterValue)) {
						// System 자동 신고
						map.put("reporterName", "시스템");
						map.put("reporterType", "SYSTEM");
						map.put("reporterDisplay", "시스템");
					} else {
						map.put("reporterName", "알 수 없음");
						map.put("reporterType", reporterValue);
						map.put("reporterDisplay", reporterValue);
					}
				} else {
					map.put("reporterName", "신고자 정보 없음");
					map.put("reporterType", "UNKNOWN");
					map.put("reporterDisplay", "알 수 없음");
				}
				
				// 배송 할당 정보가 있는 경우에만 주소 정보 조회
				if (report.getDeliveryAssignment() != null && report.getDeliveryAssignment().getAssignedId() != null) {
					try {
						List<Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(report.getDeliveryAssignment().getAssignedId());
						
						if (addressList != null && !addressList.isEmpty() && addressList.get(0) != null) {
							Object[] addresses = addressList.get(0);
							if (addresses.length >= 2) {
								map.put("startAddress", addresses[0] != null ? addresses[0].toString() : "주소 정보 없음");
								map.put("endAddress", addresses[1] != null ? addresses[1].toString() : "주소 정보 없음");
							} else {
								map.put("startAddress", "주소 정보 없음");
								map.put("endAddress", "주소 정보 없음");
							}
						} else {
							map.put("startAddress", "주소 정보 없음");
							map.put("endAddress", "주소 정보 없음");
						}
					} catch (Exception e) {
						log.error("주소 정보 조회 실패: {}", e.getMessage());
						map.put("startAddress", "주소 정보 없음");
						map.put("endAddress", "주소 정보 없음");
					}
				} else {
					map.put("startAddress", "주소 정보 없음");
					map.put("endAddress", "주소 정보 없음");
				}
				
				// 파일 정보 조회
				try {
					List<String> fileNames = reportImageRepository.findImgsByReportId(report.getReportId());
					map.put("fileNames", fileNames != null ? fileNames : new ArrayList<>());
				} catch (Exception e) {
					log.error("파일 정보 조회 실패: {}", e.getMessage());
					map.put("fileNames", new ArrayList<>());
				}
				
			} catch (Exception e) {
				log.error("Report 데이터 처리 중 오류 발생: {}", e.getMessage());
				// 오류 발생 시 기본값으로 설정
				map.put("reportId", report.getReportId());
				map.put("rTitle", "데이터 오류");
				map.put("rContent", "데이터 처리 중 오류가 발생했습니다.");
				map.put("regDate", LocalDateTime.now());
				map.put("rStatus", "ERROR");
				map.put("reporter", "ERROR");
				map.put("rCate", "");
				map.put("place", "");
				map.put("reporterName", "오류");
				map.put("reporterType", "ERROR");
				map.put("reporterDisplay", "오류");
				map.put("startAddress", "주소 정보 없음");
				map.put("endAddress", "주소 정보 없음");
				map.put("fileNames", new ArrayList<>());
			}
			
			return map;
		}).toList();
		
		return result;
	}

	// 신고 상세 확인
	public Map<String, Object> viewReport(Long ReportId) {
		try {
			Report report = reportRepository.findById(ReportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + ReportId));
			
			// 디버깅을 위한 로그 추가
			log.info("Report ID {} 상세 조회: rStatus={}, rCate={}", ReportId, 
				report.getRStatus() != null ? report.getRStatus().name() : "NULL", 
				report.getRCate() != null ? report.getRCate().name() : "NULL");
			
			Map<String, Object> map = new HashMap<>();
			
			try {
				// 기본 정보 설정
				map.put("reportId", report.getReportId());
				map.put("rTitle", report.getRTitle() != null ? report.getRTitle() : "");
				map.put("rContent", report.getRContent() != null ? report.getRContent() : "");
				map.put("regDate", report.getRegDate() != null ? report.getRegDate() : LocalDateTime.now());
				
				// 답변 여부 확인하여 상태값 동적 설정 (목록페이지와 동일한 로직)
				String finalStatus = "대기 중"; // 기본값
				if (report.getRStatus() != null) {
					String originalStatus = report.getRStatus().name();
					
					// 답변 여부 확인
					try {
						long answerCount = answerRepository.countByReportId(report.getReportId());
						boolean hasAnswer = answerCount > 0;
						
						if (hasAnswer) {
							finalStatus = "답변 완료";
						} else {
							// 원본 상태값을 한국어로 변환
							switch (originalStatus) {
								case "PENDING":
									finalStatus = "대기 중";
									break;
								case "IN_REVIEW":
									finalStatus = "검토 중";
									break;
								case "ACTION_TAKEN":
									finalStatus = "조치 완료";
									break;
								case "COMPLETED":
									finalStatus = "완료";
									break;
								case "REJECTED":
									finalStatus = "거부됨";
									break;
								case "UNEXECUTED":
									finalStatus = "미실행";
									break;
								case "PROCESSING":
									finalStatus = "처리 중";
									break;
								case "ERROR":
									finalStatus = "오류";
									break;
								default:
									finalStatus = originalStatus;
							}
						}
					} catch (Exception e) {
						log.error("답변 상태 확인 실패: {}", e.getMessage());
						finalStatus = "대기 중";
					}
				}
				map.put("rStatus", finalStatus);
				
				// reporter 필드 안전하게 처리
				String reporterValue = "COMPANY"; // 기본값
				if (report.getReporter() != null) {
					try {
						reporterValue = report.getReporter().name();
					} catch (Exception e) {
						log.error("Reporter Enum 변환 실패: {}", e.getMessage());
						reporterValue = "COMPANY";
					}
				}
				map.put("reporter", reporterValue);
				
				map.put("rCate", report.getRCate() != null ? report.getRCate().name() : "");
				map.put("place", report.getPlace() != null ? report.getPlace() : "");
				
				// 신고자 타입별 정보 설정
				if (reporterValue != null && !reporterValue.isEmpty()) {
					if ("COMPANY".equals(reporterValue)) {
						// Company 신고자
						map.put("reporterName", "회사 사용자");
						map.put("reporterType", "COMPANY");
						map.put("reporterDisplay", "회사");
					} else if ("DRIVER".equals(reporterValue)) {
						// Driver 신고자
						map.put("reporterName", "기사");
						map.put("reporterType", "DRIVER");
						map.put("reporterDisplay", "기사");
					} else if ("SYSTEM".equals(reporterValue)) {
						// System 자동 신고
						map.put("reporterName", "시스템");
						map.put("reporterType", "SYSTEM");
						map.put("reporterDisplay", "시스템");
					} else {
						map.put("reporterName", "알 수 없음");
						map.put("reporterType", reporterValue);
						map.put("reporterDisplay", reporterValue);
					}
				} else {
					map.put("reporterName", "신고자 정보 없음");
					map.put("reporterType", "UNKNOWN");
					map.put("reporterDisplay", "알 수 없음");
				}
				
				// 배송 할당 정보가 있는 경우에만 주소 정보 조회
				if (report.getDeliveryAssignment() != null && report.getDeliveryAssignment().getAssignedId() != null) {
					try {
						List<Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(report.getDeliveryAssignment().getAssignedId());
						
						if (addressList != null && !addressList.isEmpty() && addressList.get(0) != null) {
							Object[] addresses = addressList.get(0);
							if (addresses.length >= 2) {
								map.put("startAddress", addresses[0] != null ? addresses[0].toString() : "주소 정보 없음");
								map.put("endAddress", addresses[1] != null ? addresses[1].toString() : "주소 정보 없음");
							} else {
								map.put("startAddress", "주소 정보 없음");
								map.put("endAddress", "주소 정보 없음");
							}
						} else {
							map.put("startAddress", "주소 정보 없음");
							map.put("endAddress", "주소 정보 없음");
						}
					} catch (Exception e) {
						log.error("주소 정보 조회 실패: {}", e.getMessage());
						map.put("startAddress", "주소 정보 없음");
						map.put("endAddress", "주소 정보 없음");
					}
				} else {
					map.put("startAddress", "주소 정보 없음");
					map.put("endAddress", "주소 정보 없음");
				}
				
				// 파일 정보 조회
				try {
					List<String> fileNames = reportImageRepository.findImgsByReportId(report.getReportId());
					map.put("fileNames", fileNames != null ? fileNames : new ArrayList<>());
				} catch (Exception e) {
					log.error("파일 정보 조회 실패: {}", e.getMessage());
					map.put("fileNames", new ArrayList<>());
				}
				
			} catch (Exception e) {
				log.error("Report 상세 데이터 처리 중 오류 발생: {}", e.getMessage());
				// 오류 발생 시 기본값으로 설정
				map.put("reportId", report.getReportId());
				map.put("rTitle", "데이터 오류");
				map.put("rContent", "데이터 처리 중 오류가 발생했습니다.");
				map.put("regDate", LocalDateTime.now());
				map.put("rStatus", "ERROR");
				map.put("reporter", "ERROR");
				map.put("rCate", "");
				map.put("place", "");
				map.put("reporterName", "오류");
				map.put("reporterType", "ERROR");
				map.put("reporterDisplay", "오류");
				map.put("startAddress", "주소 정보 없음");
				map.put("endAddress", "주소 정보 없음");
				map.put("fileNames", new ArrayList<>());
			}
			
			return map;
			
		} catch (Exception e) {
			log.error("Report 상세 조회 실패: {}", e.getMessage());
			throw new RuntimeException("Report 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	// 신고 작성
	public ResponseEntity<?> regiReport(ReportRequestDTO reportRequestDTO, List<MultipartFile> files) {
		log.info("신고 등록 중");

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findById(reportRequestDTO.getAssignedId())
				.orElseThrow(() -> new RuntimeException("DeliveryAssignment not found"));

		Report report = Report.builder().deliveryAssignment(deliveryAssignment).reporter(reportRequestDTO.getReporter())
				.rTitle(reportRequestDTO.getRTitle()).rContent(reportRequestDTO.getRContent())
				.rStatus(ReportStatusEnum.IN_REVIEW).rCate(reportRequestDTO.getRCate()).regDate(LocalDateTime.now())
				.build();

		Report savedReport = reportRepository.save(report);
		log.info(reportRequestDTO.getRTitle());

//		log.info(savedReport);
		// 2. 파일이 있으면 ReportImg에 reportId 넣어서 저장
		if (files != null) {
			files.forEach(file -> {
				ReportImage img = ReportImage.builder().report(savedReport) // FK
						.fileName(file.getOriginalFilename()).build();
				reportImageRepository.save(img);
			});
		}

		return ResponseEntity.ok("success");
	}
}
