package com.gpt.squirrelLogistics.service.answer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.answer.AnswerRequestDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerResponseDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.answer.Answer;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.answer.AnswerRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class AnswerService {

	private final AnswerRepository answerRepository;
	private final ReportRepository reportRepository;
	private final AdminUserRepository adminUserRepository;

	// 신고/문의에 대한 답변 생성
	@Transactional
	public Long createAnswer(String content, Long adminId, Long reportId) {

		Report report = reportRepository.findById(reportId).orElseThrow();

		Answer answer = Answer.builder()
				.content(content)
				.adminUser(adminUserRepository.findById(adminId).orElseThrow())
				.report(report)
				.regDate(LocalDateTime.now())
				.build();

		answerRepository.save(answer);
		answerRepository.flush();

		return answer.getAnswerId();

	}


	//답변 수정
	@Transactional
	public Long updateAnswer(String content, Long adminId, Long reportId) {
		
		Answer answer = answerRepository.findByReportId(reportId).getFirst();
		
		answer.setAdminUser(adminUserRepository.findById(adminId).orElseThrow());
		answer.setContent(content);
		answer.setModiDate(LocalDateTime.now());
		
		answerRepository.save(answer);
		answerRepository.flush();
		
		return answer.getAnswerId();
	}

	/**
	 * 답변 삭제
	 */
	@Transactional
	public void deleteAnswer(Long answerId) {
		try {
			log.info("=== 답변 삭제 시작 ===");
			log.info("삭제 요청: answerId={}", answerId);

			Answer answer = answerRepository.findById(answerId)
					.orElseThrow(() -> new RuntimeException("답변을 찾을 수 없습니다: " + answerId));

			// Report 정보 저장 (삭제 전에)
			Report report = answer.getReport();
			log.info("연결된 Report: reportId={}, 현재 상태={}", report.getReportId(), report.getRStatus());

			// Answer 삭제
			answerRepository.delete(answer);
			log.info("Answer 삭제 성공: answerId={}", answerId);

			// Report 상태를 "신고 접수 대기"로 복원
			if (report != null) {
				log.info("Report 상태 복원 시작: reportId={}", report.getReportId());

				report.setRStatus(ReportStatusEnum.PENDING);
				report.setModiDate(LocalDateTime.now());

				Report savedReport = reportRepository.save(report);
				log.info("Report 상태 복원 성공: reportId={}, 변경된 상태={}", savedReport.getReportId(),
						savedReport.getRStatus());
			}

		} catch (Exception e) {
			log.error("답변 삭제 중 에러 발생: {}", e.getMessage(), e);
			throw new RuntimeException("답변 삭제에 실패했습니다: " + e.getMessage(), e);
		}
	}

	/**
	 * 모든 답변 목록 조회 (관리자용)
	 */
	public List<AnswerSlimResponseDTO> getAllAnswers() {
		try {
			List<Answer> answers = answerRepository.findAll();
			log.info("전체 답변 조회: {}개", answers.size());
			return answers.stream().map(this::toSlim).toList();
		} catch (Exception e) {
			log.error("답변 목록 조회 중 에러 발생: {}", e.getMessage(), e);
			throw new RuntimeException("답변 목록 조회에 실패했습니다: " + e.getMessage(), e);
		}
	}

	/**
	 * DTO 변환 메서드들
	 */
	private AnswerResponseDTO toResponse(Answer answer) {
		return AnswerResponseDTO.builder().answerId(answer.getAnswerId()).content(answer.getContent())
				.regDate(answer.getRegDate()).modiDate(answer.getModiDate()).build();
	}

	private AnswerSlimResponseDTO toSlim(Answer answer) {
		return AnswerSlimResponseDTO.builder().answerId(answer.getAnswerId()).content(answer.getContent())
				.regDate(answer.getRegDate()).modiDate(answer.getModiDate())
				.adminUserId(answer.getAdminUser() != null ? answer.getAdminUser().getAdminId() : null)
				.reportId(answer.getReport() != null ? answer.getReport().getReportId() : null).build();
	}

	/**
	 * 임시 관리자 사용자 생성
	 */
	private AdminUser createTemporaryAdminUser() {
		AdminUser tempAdmin = new AdminUser();
		tempAdmin.setAdminId(1L);
		return tempAdmin;
	}
}
