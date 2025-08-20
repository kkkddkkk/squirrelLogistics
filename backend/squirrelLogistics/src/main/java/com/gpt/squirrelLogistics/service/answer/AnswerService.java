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
    
    /**
     * 신고/문의에 대한 답변 생성
     */
    @Transactional
    public AnswerResponseDTO createAnswer(AnswerRequestDTO dto) {
        try {
            log.info("=== 답변 생성 시작 ===");
            log.info("입력 데이터: reportId={}, content={}", dto.getReportId(), dto.getContent());
            
            // 1. Report 존재 여부 확인
            Report report = reportRepository.findById(dto.getReportId())
                .orElseThrow(() -> new RuntimeException("신고/문의를 찾을 수 없습니다: " + dto.getReportId()));
            
            log.info("Report 조회 성공: reportId={}, 현재 상태={}", report.getReportId(), report.getRStatus());
            
            // 2. 임시 관리자 사용자 생성
            AdminUser tempAdmin = createTemporaryAdminUser();
            log.info("임시 관리자 생성: adminId={}", tempAdmin.getAdminId());
            
            // 3. Answer 엔티티 생성
            Answer answer = Answer.builder()
                .content(dto.getContent())
                .adminUser(tempAdmin)
                .report(report)
                .regDate(LocalDateTime.now())
                .modiDate(LocalDateTime.now())
                .build();
            
            log.info("Answer 엔티티 생성 완료: {}", answer);
            
            // 4. Answer 저장
            Answer savedAnswer = answerRepository.save(answer);
            log.info("Answer 저장 성공: answerId={}", savedAnswer.getAnswerId());
            
            // 5. Report 상태를 "조치 완료"로 변경 (강제 업데이트)
            log.info("=== Report 상태 강제 업데이트 시작 ===");
            log.info("업데이트 전 상태: reportId={}, 상태={}", report.getReportId(), report.getRStatus());
            
            // 새로운 Report 엔티티로 다시 조회
            Report freshReport = reportRepository.findById(dto.getReportId())
                .orElseThrow(() -> new RuntimeException("Report를 다시 찾을 수 없습니다: " + dto.getReportId()));
            
            log.info("새로 조회한 Report: reportId={}, 상태={}", freshReport.getReportId(), freshReport.getRStatus());
            
            // 상태 변경
            freshReport.setRStatus(ReportStatusEnum.ACTION_TAKEN);
            freshReport.setModiDate(LocalDateTime.now());
            
            log.info("상태 변경 후: reportId={}, 상태={}", freshReport.getReportId(), freshReport.getRStatus());
            
            // 저장
            Report savedReport = reportRepository.save(freshReport);
            log.info("Report 저장 후: reportId={}, 상태={}", savedReport.getReportId(), savedReport.getRStatus());
            
            // 데이터베이스에서 다시 조회하여 확인
            Report verifyReport = reportRepository.findById(dto.getReportId())
                .orElseThrow(() -> new RuntimeException("Report 검증을 위해 찾을 수 없습니다: " + dto.getReportId()));
            
            log.info("검증 조회 결과: reportId={}, 상태={}", verifyReport.getReportId(), verifyReport.getRStatus());
            
            log.info("=== Report 상태 업데이트 완료 ===");
            log.info("=== 답변 생성 완료 ===");
            
            return toResponse(savedAnswer);
            
        } catch (Exception e) {
            log.error("답변 생성 중 에러 발생: {}", e.getMessage(), e);
            throw new RuntimeException("답변 생성에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 신고/문의 ID로 답변 조회
     */
    @Transactional
    public AnswerResponseDTO getAnswerByReportId(Long reportId) {
        try {
            log.info("=== 답변 조회 시작 ===");
            log.info("조회 요청: reportId={}", reportId);
            
            // 1. Report 조회
            Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("신고/문의를 찾을 수 없습니다: " + reportId));
            
            log.info("Report 조회 성공: reportId={}, 현재 상태={}", report.getReportId(), report.getRStatus());
            
            // 2. 답변 조회
            List<Answer> answers = answerRepository.findAll();
            Optional<Answer> answerOpt = answers.stream()
                .filter(answer -> answer.getReport() != null && 
                                answer.getReport().getReportId().equals(reportId))
                .findFirst();
            
            // 3. 답변이 있으면 Report 상태를 "ACTION_TAKEN"으로 업데이트
            if (answerOpt.isPresent()) {
                Answer answer = answerOpt.get();
                log.info("답변 조회 성공: answerId={}, content={}", answer.getAnswerId(), answer.getContent());
                
                // Report 상태가 "ACTION_TAKEN"이 아니면 업데이트
                if (report.getRStatus() != ReportStatusEnum.ACTION_TAKEN) {
                    log.info("Report 상태를 ACTION_TAKEN으로 업데이트: reportId={}, 현재 상태={}", reportId, report.getRStatus());
                    report.setRStatus(ReportStatusEnum.ACTION_TAKEN);
                    report.setModiDate(LocalDateTime.now());
                    reportRepository.save(report);
                    log.info("Report 상태 업데이트 완료: reportId={}, 변경된 상태={}", reportId, report.getRStatus());
                }
                
                return toResponse(answer);
            } else {
                log.info("답변이 없음: reportId={}", reportId);
                
                // 답변이 없으면 Report 상태를 "IN_REVIEW"로 업데이트
                if (report.getRStatus() != ReportStatusEnum.IN_REVIEW) {
                    log.info("Report 상태를 IN_REVIEW로 업데이트: reportId={}, 현재 상태={}", reportId, report.getRStatus());
                    report.setRStatus(ReportStatusEnum.IN_REVIEW);
                    report.setModiDate(LocalDateTime.now());
                    reportRepository.save(report);
                    log.info("Report 상태 업데이트 완료: reportId={}, 변경된 상태={}", reportId, report.getRStatus());
                }
                
                return null;
            }
            
        } catch (Exception e) {
            log.error("답변 조회 중 에러 발생: {}", e.getMessage(), e);
            throw new RuntimeException("답변 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 답변 수정
     */
    @Transactional
    public AnswerResponseDTO updateAnswer(Long answerId, AnswerRequestDTO dto) {
        try {
            log.info("=== 답변 수정 시작 ===");
            log.info("수정 요청: answerId={}, content={}", answerId, dto.getContent());
            
            Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("답변을 찾을 수 없습니다: " + answerId));
            
            answer.setContent(dto.getContent());
            answer.setModiDate(LocalDateTime.now());
            
            Answer updatedAnswer = answerRepository.save(answer);
            log.info("답변 수정 성공: answerId={}", updatedAnswer.getAnswerId());
            
            return toResponse(updatedAnswer);
            
        } catch (Exception e) {
            log.error("답변 수정 중 에러 발생: {}", e.getMessage(), e);
            throw new RuntimeException("답변 수정에 실패했습니다: " + e.getMessage(), e);
        }
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
                log.info("Report 상태 복원 성공: reportId={}, 변경된 상태={}", savedReport.getReportId(), savedReport.getRStatus());
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
        return AnswerResponseDTO.builder()
            .answerId(answer.getAnswerId())
            .content(answer.getContent())
            .regDate(answer.getRegDate())
            .modiDate(answer.getModiDate())
            .build();
    }
    
    private AnswerSlimResponseDTO toSlim(Answer answer) {
        return AnswerSlimResponseDTO.builder()
            .answerId(answer.getAnswerId())
            .content(answer.getContent())
            .regDate(answer.getRegDate())
            .modiDate(answer.getModiDate())
            .adminUserId(answer.getAdminUser() != null ? answer.getAdminUser().getAdminId() : null)
            .reportId(answer.getReport() != null ? answer.getReport().getReportId() : null)
            .build();
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
