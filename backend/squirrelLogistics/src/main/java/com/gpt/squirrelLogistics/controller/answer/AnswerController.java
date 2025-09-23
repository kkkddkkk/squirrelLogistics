package com.gpt.squirrelLogistics.controller.answer;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.answer.AnswerRequestDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerResponseDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.answer.Answer;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.service.answer.AnswerService;
import com.gpt.squirrelLogistics.service.report.ReportForAdminService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/admin/answer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class AnswerController {

	private final AnswerService answerService;
	private final FindUserByTokenService findUserByTokenService;
	private final ReportForAdminService reportForAdminService;
	private final AdminUserRepository adminUserRepository;

	@Getter
	public static class RequestAnswerDto { // ✅ static
		private String content;
		// getter/setter
	}

	// 답변 생성
	@PostMapping
	@TimedEndpoint("answer")
	public Map<String, Long> createAnswer(@RequestHeader("Authorization") String token,
			@RequestParam(name = "reportId") Long reportId, @RequestBody RequestAnswerDto dto) {

		Long userId = findUserByTokenService.getUserIdByToken(token);
		Long adminId = adminUserRepository.findAdminIdByUserId(userId).orElseThrow();

		Long answerId = answerService.createAnswer(dto.getContent(), adminId, reportId);
		reportForAdminService.setReportInActionTaken(reportId);

		return Map.of("answerId", answerId);
	}

	// 답변 수정
	@PutMapping
	@TimedEndpoint("answer")
	public Map<String, Long> updateAnswer(@RequestHeader("Authorization") String token,
			@RequestParam(name = "reportId") Long reportId, @RequestBody RequestAnswerDto dto) {
		
		Long userId = findUserByTokenService.getUserIdByToken(token);
		Long adminId = adminUserRepository.findAdminIdByUserId(userId).orElseThrow();
		
		Long answerId = answerService.updateAnswer(dto.getContent(), adminId, reportId);
		
		return Map.of("answerId", answerId);
	}

	/**
	 * 답변 삭제
	 */
	@DeleteMapping("/{answerId}")
	public ResponseEntity<Map<String, Object>> deleteAnswer(@PathVariable Long answerId) {
		try {
			log.info("답변 삭제 요청 (answerId: {})", answerId);

			answerService.deleteAnswer(answerId);
			log.info("답변 삭제 성공: answerId={}", answerId);

			Map<String, Object> response = Map.of("success", true, "message", "답변이 성공적으로 삭제되었습니다.");

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("답변 삭제 실패 (answerId: {}): {}", answerId, e.getMessage(), e);

			Map<String, Object> errorResponse = Map.of("success", false, "message", "답변 삭제에 실패했습니다: " + e.getMessage());

			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
		}
	}

	/**
	 * 모든 답변 목록 조회 (관리자용)
	 */
	@GetMapping
	public ResponseEntity<Map<String, Object>> getAllAnswers() {
		try {
			log.info("전체 답변 목록 조회 요청");

			List<AnswerSlimResponseDTO> answers = answerService.getAllAnswers();
			log.info("답변 목록 조회 성공: {}개", answers.size());

			Map<String, Object> response = Map.of("success", true, "data", answers, "message", "답변 목록을 성공적으로 조회했습니다.",
					"total", answers.size());

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("답변 목록 조회 실패: {}", e.getMessage(), e);

			Map<String, Object> errorResponse = Map.of("success", false, "message",
					"답변 목록 조회에 실패했습니다: " + e.getMessage());

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}



}
