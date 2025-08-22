package com.gpt.squirrelLogistics.service.report;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.reportImage.ReportImage;
import com.gpt.squirrelLogistics.entity.answer.Answer;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.repository.answer.AnswerRepository;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

	private final ReportRepository reportRepository;
	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final ReportImageRepository reportImageRepository;
	private final AnswerRepository answerRepository;

	/**
	 * 🔧 공통 Report 데이터 변환 메서드
	 * 목록과 상세에서 동일한 데이터 구조 보장
	 */
	private Map<String, Object> convertReportToMap(Report report) {
		Map<String, Object> map = new HashMap<>();
		
		try {
			// 디버깅: 원본 Report 엔티티 값 확인
			log.info("🔍 Report ID {} 처리 중: rStatus={}, rCate={}, reporter={}", 
				report.getReportId(),
				report.getRStatus() != null ? report.getRStatus().name() : "NULL",
				report.getRCate() != null ? report.getRCate().name() : "NULL",
				report.getReporter() != null ? report.getReporter().name() : "NULL"
			);
			
			// 기본 정보 설정
			map.put("reportId", report.getReportId());
			map.put("rTitle", report.getRTitle() != null ? report.getRTitle() : "");
			map.put("rContent", report.getRContent() != null ? report.getRContent() : "");
			map.put("regDate", report.getRegDate() != null ? report.getRegDate() : LocalDateTime.now());
			map.put("modiDate", report.getModiDate());
			
			// 🎯 답변 여부를 우선으로 하여 상태값 동적 설정
			String finalStatus = "대기 중"; // 기본값
			
			try {
				// 답변 여부를 먼저 확인
				long answerCount = answerRepository.countByReportId(report.getReportId());
				boolean hasAnswer = answerCount > 0;
				
				if (hasAnswer) {
					// 답변이 있으면 무조건 "답변 완료"
					finalStatus = "답변 완료";
					log.info("🔍 Report ID {}: 답변 {}건 존재 → 상태값 '답변 완료'로 설정", 
						report.getReportId(), answerCount);
				} else {
					// 답변이 없으면 원본 상태값을 한국어로 변환
					if (report.getRStatus() != null) {
						String originalStatus = report.getRStatus().name();
						finalStatus = convertStatusToKorean(originalStatus);
						log.info("🔍 Report ID {}: 답변 없음, 원본 상태값 {} → {}로 변환", 
							report.getReportId(), originalStatus, finalStatus);
					} else {
						finalStatus = "대기 중";
						log.info("🔍 Report ID {}: 답변 없음, 원본 상태값 NULL → 기본값 '대기 중'으로 설정", 
							report.getReportId());
					}
				}
			} catch (Exception e) {
				log.error("❌ 답변 상태 확인 실패: {}", e.getMessage());
				finalStatus = "대기 중";
			}
			map.put("rStatus", finalStatus);
			
			// reporter 필드 안전하게 처리
			String reporterValue = "COMPANY"; // 기본값
			if (report.getReporter() != null) {
				try {
					reporterValue = report.getReporter().name();
				} catch (Exception e) {
					log.error("❌ Reporter Enum 변환 실패: {}", e.getMessage());
					reporterValue = "COMPANY";
				}
			}
			map.put("reporter", reporterValue);
			
			// 신고자 정보 설정
			setReporterInfo(map, reporterValue);
			
			// rCate 필드 안전하게 처리
			String categoryValue = "기타"; // 기본값
			if (report.getRCate() != null) {
				try {
					String originalCategory = report.getRCate().name();
					categoryValue = convertCategoryToKorean(originalCategory);
				} catch (Exception e) {
					log.error("❌ Category Enum 변환 실패: {}", e.getMessage());
					categoryValue = "기타";
				}
			}
			map.put("rCate", categoryValue);
			
			map.put("place", report.getPlace() != null ? report.getPlace() : "");
			
			// 배송 할당 정보 처리
			setDeliveryInfo(map, report);
			
			// 파일 정보 조회
			setFileInfo(map, report.getReportId());
			
			log.info("✅ Report ID {} 변환 완료: rStatus={}, rCate={}", 
				report.getReportId(), map.get("rStatus"), map.get("rCate"));
			
		} catch (Exception e) {
			log.error("❌ Report 데이터 처리 중 오류 발생: {}", e.getMessage());
			setErrorDefaults(map, report.getReportId());
		}
		
		return map;
	}
	
	/**
	 * 🎯 상태값을 한국어로 변환 (답변이 없는 경우에만 사용)
	 */
	private String convertStatusToKorean(String status) {
		switch (status) {
			case "PENDING": return "대기 중";
			case "IN_REVIEW": return "검토 중";
			case "ACTION_TAKEN": return "처리 중"; // 🚨 "조치 완료" → "처리 중"으로 변경
			case "COMPLETED": return "완료";
			case "REJECTED": return "거부됨";
			case "UNEXECUTED": return "미실행";
			case "PROCESSING": return "처리 중";
			case "ERROR": return "오류";
			default: return status;
		}
	}
	
	/**
	 * 카테고리를 한국어로 변환
	 */
	private String convertCategoryToKorean(String category) {
		switch (category) {
			case "SERVICE": return "서비스";
			case "DAMAGE": return "상품 파손";
			case "UNEXECUTED": return "운송 미실행";
			case "DELIVERY": return "배송";
			case "COMPLAINT": return "불만사항";
			case "DELAY": return "배송 지연";
			case "LOST": return "상품 분실";
			case "OTHER": return "기타";
			default: return category;
		}
	}
	
	/**
	 * 신고자 정보 설정
	 */
	private void setReporterInfo(Map<String, Object> map, String reporterValue) {
		if ("COMPANY".equals(reporterValue)) {
			map.put("reporterName", "회사 사용자");
			map.put("reporterType", "COMPANY");
			map.put("reporterDisplay", "회사");
		} else if ("DRIVER".equals(reporterValue)) {
			map.put("reporterName", "기사");
			map.put("reporterType", "DRIVER");
			map.put("reporterDisplay", "기사");
		} else if ("SYSTEM".equals(reporterValue)) {
			map.put("reporterName", "시스템");
			map.put("reporterType", "SYSTEM");
			map.put("reporterDisplay", "시스템");
		} else {
			map.put("reporterName", "알 수 없음");
			map.put("reporterType", reporterValue);
			map.put("reporterDisplay", reporterValue);
		}
	}
	
	/**
	 * 배송 정보 설정
	 */
	private void setDeliveryInfo(Map<String, Object> map, Report report) {
		if (report.getDeliveryAssignment() != null && report.getDeliveryAssignment().getAssignedId() != null) {
			map.put("deliveryAssignmentId", report.getDeliveryAssignment().getAssignedId());
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
				log.error("❌ 주소 정보 조회 실패: {}", e.getMessage());
				map.put("startAddress", "주소 정보 없음");
				map.put("endAddress", "주소 정보 없음");
			}
		} else {
			map.put("deliveryAssignmentId", null);
			map.put("startAddress", "주소 정보 없음");
			map.put("endAddress", "주소 정보 없음");
		}
	}
	
	/**
	 * 파일 정보 설정
	 */
	private void setFileInfo(Map<String, Object> map, Long reportId) {
		try {
			List<String> fileNames = reportImageRepository.findImgsByReportId(reportId);
			map.put("fileNames", fileNames != null ? fileNames : new ArrayList<>());
		} catch (Exception e) {
			log.error("❌ 파일 정보 조회 실패: {}", e.getMessage());
			map.put("fileNames", new ArrayList<>());
		}
	}
	
	/**
	 * 오류 시 기본값 설정
	 */
	private void setErrorDefaults(Map<String, Object> map, Long reportId) {
		map.put("reportId", reportId);
		map.put("rTitle", "데이터 오류");
		map.put("rContent", "데이터 처리 중 오류가 발생했습니다.");
		map.put("regDate", LocalDateTime.now());
		map.put("modiDate", null);
		map.put("rStatus", "오류");
		map.put("reporter", "ERROR");
		map.put("rCate", "기타");
		map.put("place", "");
		map.put("reporterName", "오류");
		map.put("reporterType", "ERROR");
		map.put("reporterDisplay", "오류");
		map.put("deliveryAssignmentId", null);
		map.put("startAddress", "주소 정보 없음");
		map.put("endAddress", "주소 정보 없음");
		map.put("fileNames", new ArrayList<>());
	}

	// 🎯 신고 전체 목록 조회 - 통일된 데이터 구조 사용
	public List<Map<String, Object>> reportList(){
		try {
			List<Report> allList = reportRepository.findAll();
			List<Map<String, Object>> list = new ArrayList<>();

			for (Report report : allList) {
				Map<String, Object> reportMap = convertReportToMap(report);
				list.add(reportMap);
			}
			
			log.info("✅ Report 목록 조회 완료: 총 {}건", list.size());
			return list;
		} catch (Exception e) {
			log.error("❌ Report 목록 조회 실패: {}", e.getMessage());
			throw new RuntimeException("신고 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	// 🎯 신고 상세 확인 - 목록과 동일한 데이터 구조 사용
	public Map<String, Object> viewReport(Long ReportId) {
		try {
			Report report = reportRepository.findById(ReportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + ReportId));
			
			log.info("📋 Report ID {} 상세 조회 시작", ReportId);
			
			// 목록과 동일한 변환 메서드 사용
			Map<String, Object> reportDetail = convertReportToMap(report);
			
			log.info("✅ Report ID {} 상세 조회 완료", ReportId);
			return reportDetail;
			
		} catch (Exception e) {
			log.error("❌ Report 상세 조회 실패: {}", e.getMessage());
			throw new RuntimeException("Report 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	// 기존 메서드들 유지 (신고 등록, 수정, 삭제 등)
	public List<ReportSlimResponseDTO> AllViewReport() {
		List<Report> reportList = reportRepository.findAll();
		List<ReportSlimResponseDTO> dtoList = new ArrayList<>();

		for (Report report : reportList) {
			List<String> images = new ArrayList<>();
			try {
				images = reportImageRepository.findImgsByReportId(report.getReportId());
			} catch (Exception e) {
				log.error("❌ 이미지 조회 실패: {}", e.getMessage());
			}

			ReportSlimResponseDTO reportSlimResponseDTO = ReportSlimResponseDTO.builder()
				.reportId(report.getReportId())
				.reporter(report.getReporter() != null ? report.getReporter().name() : "UNKNOWN")
				.rTitle(report.getRTitle() != null ? report.getRTitle() : "")
				.rContent(report.getRContent() != null ? report.getRContent() : "")
				.rStatus(report.getRStatus() != null ? report.getRStatus().name() : "PENDING") // String으로 변환
				.rCate(report.getRCate() != null ? report.getRCate().name() : "OTHER") // String으로 변환
				.place(report.getPlace() != null ? report.getPlace() : "")
				.deliveryAssignmentId(report.getDeliveryAssignment() != null ? report.getDeliveryAssignment().getAssignedId() : null)
				.regDate(report.getRegDate() != null ? report.getRegDate() : LocalDateTime.now())
				.modiDate(report.getModiDate())
				.fileName(images != null ? images : new ArrayList<>())
				.build();

			dtoList.add(reportSlimResponseDTO);
		}

		return dtoList;
	}

	public ReportResponseDTO registerReport(ReportRequestDTO reportRequestDTO) {
		try {
			Optional<DeliveryAssignment> optionalDeliveryAssignment = deliveryAssignmentRepository.findById(reportRequestDTO.getAssignedId());

			if (!optionalDeliveryAssignment.isPresent()) {
				throw new RuntimeException("DeliveryAssignment not found with ID: " + reportRequestDTO.getAssignedId());
			}

			DeliveryAssignment deliveryAssignment = optionalDeliveryAssignment.get();

			Report report = Report.builder()
				.deliveryAssignment(deliveryAssignment)
				.reporter(reportRequestDTO.getReporter())
				.rTitle(reportRequestDTO.getRTitle())
				.rContent(reportRequestDTO.getRContent())
				.rStatus(reportRequestDTO.getRStatus())
				.rCate(reportRequestDTO.getRCate())
				.place(reportRequestDTO.getPlace())
				.regDate(LocalDateTime.now())
				.build();

			Report savedReport = reportRepository.save(report);

			ReportResponseDTO reportResponseDTO = ReportResponseDTO.builder()
				.reportId(savedReport.getReportId())
				.deliveryAssignment(null) // DTO 타입 문제로 null 설정
				.reporter(savedReport.getReporter())
				.rTitle(savedReport.getRTitle())
				.rContent(savedReport.getRContent())
				.rStatus(savedReport.getRStatus())
				.rCate(savedReport.getRCate())
				.place(savedReport.getPlace())
				.regDate(savedReport.getRegDate())
				.modiDate(savedReport.getModiDate())
				.build();

			log.info("✅ Report 등록 완료: ID {}", savedReport.getReportId());
			return reportResponseDTO;

		} catch (Exception e) {
			log.error("❌ Report 등록 실패: {}", e.getMessage());
			throw new RuntimeException("Report 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	public ReportResponseDTO modifyReport(Long reportId, ReportRequestDTO reportRequestDTO) {
		try {
			Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));

			report.setRTitle(reportRequestDTO.getRTitle());
			report.setRContent(reportRequestDTO.getRContent());
			report.setRStatus(reportRequestDTO.getRStatus());
			report.setRCate(reportRequestDTO.getRCate());
			report.setPlace(reportRequestDTO.getPlace());
			report.setModiDate(LocalDateTime.now());

			Report savedReport = reportRepository.save(report);

			ReportResponseDTO reportResponseDTO = ReportResponseDTO.builder()
				.reportId(savedReport.getReportId())
				.deliveryAssignment(null) // DTO 타입 문제로 null 설정
				.reporter(savedReport.getReporter())
				.rTitle(savedReport.getRTitle())
				.rContent(savedReport.getRContent())
				.rStatus(savedReport.getRStatus())
				.rCate(savedReport.getRCate())
				.place(savedReport.getPlace())
				.regDate(savedReport.getRegDate())
				.modiDate(savedReport.getModiDate())
				.build();

			log.info("✅ Report 수정 완료: ID {}", savedReport.getReportId());
			return reportResponseDTO;

		} catch (Exception e) {
			log.error("❌ Report 수정 실패: {}", e.getMessage());
			throw new RuntimeException("Report 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	public void removeReport(Long reportId) {
		try {
			Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));

			reportRepository.delete(report);
			log.info("✅ Report 삭제 완료: ID {}", reportId);

		} catch (Exception e) {
			log.error("❌ Report 삭제 실패: {}", e.getMessage());
			throw new RuntimeException("Report 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	public void uploadImages(String reportIdStr, List<MultipartFile> images) {

		try {
			Long reportId = Long.parseLong(reportIdStr);

			Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));

			for (MultipartFile image : images) {
				if (!image.isEmpty()) {
					ReportImage reportImage = ReportImage.builder()
						.report(report)
						.fileName(image.getOriginalFilename()) // fileName 필드만 사용
						.build();

					reportImageRepository.save(reportImage);
				}
			}

			log.info("✅ Report 이미지 업로드 완료: ID {}, 이미지 {}개", reportId, images.size());

		} catch (Exception e) {
			log.error("❌ Report 이미지 업로드 실패: {}", e.getMessage());
			throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 신고 등록 (Controller에서 호출)
	 */
	public void regiReport(ReportRequestDTO reportRequestDTO, List<MultipartFile> files) {
		try {
			// 신고 등록
			ReportResponseDTO savedReport = registerReport(reportRequestDTO);
			log.info("✅ 신고 등록 완료: ID {}", savedReport.getReportId());
			
			// 이미지 업로드 (있는 경우)
			if (files != null && !files.isEmpty()) {
				uploadImages(String.valueOf(savedReport.getReportId()), files);
			}
			
		} catch (Exception e) {
			log.error("❌ 신고 등록 실패: {}", e.getMessage());
			throw new RuntimeException("신고 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 등록
	 */
	public void registerAnswer(Long reportId, String content) {
		try {
			// Report 엔티티 조회
			Report report = reportRepository.findById(reportId)
				.orElseThrow(() -> new RuntimeException("Report not found with ID: " + reportId));
			
			// 임시 AdminUser 생성 (실제로는 로그인된 사용자 사용)
			AdminUser adminUser = AdminUser.builder()
				.adminId(1L)
				.build();
			
			// 답변 엔티티 생성
			Answer answer = Answer.builder()
				.report(report) // Report 객체
				.content(content)
				.adminUser(adminUser) // AdminUser 객체
				.regDate(LocalDateTime.now())
				.build();
			
			// 답변 저장
			answerRepository.save(answer);
			
			log.info("✅ 답변 등록 완료: Report ID {}, Content: {}", reportId, content);
			
		} catch (Exception e) {
			log.error("❌ 답변 등록 실패: {}", e.getMessage());
			throw new RuntimeException("답변 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 목록 조회
	 */
	public List<Map<String, Object>> getAnswerList(Long reportId) {
		try {
			List<Answer> answers = answerRepository.findByReportId(reportId);
			List<Map<String, Object>> answerList = new ArrayList<>();
			
			for (Answer answer : answers) {
				Map<String, Object> answerMap = new HashMap<>();
				answerMap.put("answerId", answer.getAnswerId());
				answerMap.put("reportId", answer.getReport().getReportId()); // Report 객체에서 ID 추출
				answerMap.put("content", answer.getContent());
				answerMap.put("adminId", answer.getAdminUser().getAdminId()); // AdminUser 객체에서 ID 추출
				answerMap.put("adminName", "관리자"); // 기본 관리자 이름
				answerMap.put("regDate", answer.getRegDate());
				
				answerList.add(answerMap);
			}
			
			log.info("✅ 답변 목록 조회 완료: Report ID {}, {}건", reportId, answerList.size());
			return answerList;
			
		} catch (Exception e) {
			log.error("❌ 답변 목록 조회 실패: {}", e.getMessage());
			throw new RuntimeException("답변 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 수정
	 */
	public void updateAnswer(Long answerId, String content) {
		try {
			log.info("답변 수정 시작: Answer ID {}, 내용: {}", answerId, content);
			
			Answer answer = answerRepository.findById(answerId)
				.orElseThrow(() -> new RuntimeException("Answer not found with ID: " + answerId));
			
			// 답변 내용 수정
			answer.setContent(content);
			answer.setModiDate(LocalDateTime.now());
			
			// 저장
			answerRepository.save(answer);
			
			log.info("✅ 답변 수정 완료: Answer ID {}", answerId);
			
		} catch (Exception e) {
			log.error("❌ 답변 수정 실패: {}", e.getMessage());
			throw new RuntimeException("답변 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 삭제
	 */
	public void deleteAnswer(Long answerId) {
		try {
			log.info("답변 삭제 시작: Answer ID {}", answerId);
			
			Answer answer = answerRepository.findById(answerId)
				.orElseThrow(() -> new RuntimeException("Answer not found with ID: " + answerId));
			
			// 답변 삭제
			answerRepository.delete(answer);
			
			log.info("✅ 답변 삭제 완료: Answer ID {}", answerId);
			
		} catch (Exception e) {
			log.error("❌ 답변 삭제 실패: {}", e.getMessage());
			throw new RuntimeException("답변 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}