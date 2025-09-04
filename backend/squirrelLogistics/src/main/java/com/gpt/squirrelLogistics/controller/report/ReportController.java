package com.gpt.squirrelLogistics.controller.report;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.report.ReportService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/report")
public class ReportController {
	private final ReportService reportService;
	private final DeliveryAssignmentRepository assignmentRepository;
	private final String uploadDir = new File("uploads").getAbsolutePath() + "/";
	private final FindUserByTokenService findUserByTokenService;
	private final CompanyRepository companyRepository;
	private final DriverRepository driverRepository;
	private final UserRepository userRepository;

	// 김도경: userId로 reportList 찾기
	@GetMapping("/list")
	@TimedEndpoint("reportList")
	public List<Map<String, Object>> reportList(@RequestHeader("Authorization") String token) {

		Long userId = findUserByTokenService.getUserIdByToken(token);
		UserRoleEnum userType = userRepository.getReferenceById(userId).getRole();

		List<Map<String, Object>> result = null;
		if (userType == UserRoleEnum.COMPANY) {
			Long companyId = companyRepository.findCompanyIdByUserId(userId);
			result = reportService.reportList(companyId);
		} else if (userType == UserRoleEnum.DRIVER) {
			Long driverId = driverRepository.findDriverIdByUserId(userId);
			result = reportService.driverReportList(driverId);
		}
		return result;
	}

	@GetMapping
	@TimedEndpoint("viewReport")
	public ReportSlimResponseDTO viewReport(@RequestParam("reportId") Long reportId) {
		return reportService.viewReport(reportId);
	}

	@PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
	@TimedEndpoint("regiReport")
	public ResponseEntity<?> regiReport(@RequestPart("report") String reportJson,
			@RequestPart(value = "files", required = false) List<MultipartFile> files)
			throws JsonMappingException, JsonProcessingException {
		log.info("reportJson raw: {}", reportJson);

		ObjectMapper mapper = JsonMapper.builder().enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES).build();
		ReportRequestDTO reportRequestDTO = mapper.readValue(reportJson, ReportRequestDTO.class);

		if (files != null) {
			for (MultipartFile file : files) {
				try {
					String filePath = uploadDir + file.getOriginalFilename();
					File dest = new File(filePath);
					dest.getParentFile().mkdirs();
					file.transferTo(dest);

					// DB에는 file.getOriginalFilename() 저장
				} catch (Exception e) {
					log.error("File upload failed for {}: {}", file.getOriginalFilename(), e.getMessage(), e);
					return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
				}
			}
		}

		reportService.regiReport(reportRequestDTO, files);

		return ResponseEntity.ok("success");
	}

	/**
	 * 🎯 답변 등록 API
	 */
	@PostMapping("/answer/register")
	public ResponseEntity<?> registerAnswer(@RequestBody Map<String, Object> answerRequest) {
		try {
			log.info("답변 등록 요청: {}", answerRequest);

			Long reportId = Long.valueOf(answerRequest.get("reportId").toString());
			String content = (String) answerRequest.get("content");

			// 답변 등록 서비스 호출
			reportService.registerAnswer(reportId, content);

			log.info("답변 등록 완료: Report ID {}", reportId);
			return ResponseEntity.ok("답변이 등록되었습니다.");

		} catch (Exception e) {
			log.error("답변 등록 실패: {}", e.getMessage());
			return ResponseEntity.badRequest().body("답변 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 목록 조회 API
	 */
	@GetMapping("/answer/list")
	public ResponseEntity<?> getAnswerList(@RequestParam("reportId") Long reportId) {
		try {
			log.info("답변 목록 조회 요청: Report ID {}", reportId);

			List<Map<String, Object>> answers = reportService.getAnswerList(reportId);

			log.info("답변 목록 조회 완료: {}건", answers.size());
			return ResponseEntity.ok(answers);

		} catch (Exception e) {
			log.error("답변 목록 조회 실패: {}", e.getMessage());
			return ResponseEntity.badRequest().body("답변 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 수정 API
	 */
	@PutMapping("/answer/{answerId}")
	public ResponseEntity<?> updateAnswer(@PathVariable Long answerId, @RequestBody Map<String, Object> updateRequest) {
		try {
			log.info("답변 수정 요청: Answer ID {}, 내용: {}", answerId, updateRequest.get("content"));

			String content = (String) updateRequest.get("content");

			// 답변 수정 서비스 호출
			reportService.updateAnswer(answerId, content);

			log.info("답변 수정 완료: Answer ID {}", answerId);
			return ResponseEntity.ok("답변이 수정되었습니다.");

		} catch (Exception e) {
			log.error("답변 수정 실패: {}", e.getMessage());
			return ResponseEntity.badRequest().body("답변 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 🎯 답변 삭제 API
	 */
	@DeleteMapping("/answer/{answerId}")
	public ResponseEntity<?> deleteAnswer(@PathVariable Long answerId) {
		try {
			log.info("답변 삭제 요청: Answer ID {}", answerId);

			// 답변 삭제 서비스 호출
			reportService.deleteAnswer(answerId);

			log.info("답변 삭제 완료: Answer ID {}", answerId);
			return ResponseEntity.ok("답변이 삭제되었습니다.");

		} catch (Exception e) {
			log.error("답변 삭제 실패: {}", e.getMessage());
			return ResponseEntity.badRequest().body("답변 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

}
