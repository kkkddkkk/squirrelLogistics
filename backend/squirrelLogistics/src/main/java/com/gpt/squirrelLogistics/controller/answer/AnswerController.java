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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.answer.AnswerRequestDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerResponseDTO;
import com.gpt.squirrelLogistics.dto.answer.AnswerSlimResponseDTO;
import com.gpt.squirrelLogistics.service.answer.AnswerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/public/answers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class AnswerController {
    
    private final AnswerService answerService;
    
    /**
     * 신고/문의에 대한 답변 생성
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, Object>> createAnswer(@Valid @RequestBody AnswerRequestDTO dto) {
        try {
            log.info("답변 생성 요청: reportId={}", dto.getReportId());
            
            AnswerResponseDTO created = answerService.createAnswer(dto);
            log.info("답변 생성 성공: answerId={}", created.getAnswerId());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", created,
                "message", "답변이 성공적으로 등록되었습니다."
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("답변 생성 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 등록에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * 신고/문의 ID로 답변 조회
     */
    @GetMapping("/report/{reportId}")
    public ResponseEntity<Map<String, Object>> getAnswerByReportId(@PathVariable Long reportId) {
        try {
            log.info("답변 조회 요청 (reportId: {})", reportId);
            
            AnswerResponseDTO answer = answerService.getAnswerByReportId(reportId);
            
            if (answer != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", answer);
                response.put("message", "답변을 성공적으로 조회했습니다.");
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", null);
                response.put("message", "해당 신고/문의에 대한 답변이 없습니다.");
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("답변 조회 실패 (reportId: {}): {}", reportId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "답변 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * 답변 수정
     */
    @PutMapping("/{answerId}")
    public ResponseEntity<Map<String, Object>> updateAnswer(
            @PathVariable Long answerId, 
            @Valid @RequestBody AnswerRequestDTO dto) {
        try {
            log.info("답변 수정 요청 (answerId: {}): {}", answerId, dto);
            
            AnswerResponseDTO updated = answerService.updateAnswer(answerId, dto);
            log.info("답변 수정 성공: answerId={}", updated.getAnswerId());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", updated,
                "message", "답변이 성공적으로 수정되었습니다."
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("답변 수정 실패 (answerId: {}): {}", answerId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 수정에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
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
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "답변이 성공적으로 삭제되었습니다."
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("답변 삭제 실패 (answerId: {}): {}", answerId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 삭제에 실패했습니다: " + e.getMessage()
            );
            
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
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", answers,
                "message", "답변 목록을 성공적으로 조회했습니다.",
                "total", answers.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("답변 목록 조회 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * 테스트용: Report 상태 강제 변경 API
     */
    @PostMapping("/test/update-status/{reportId}")
    public ResponseEntity<Map<String, Object>> testUpdateReportStatus(@PathVariable Long reportId) {
        try {
            log.info("테스트: Report 상태 변경 요청 (reportId: {})", reportId);
            
            // 강제로 상태 변경 테스트
            AnswerResponseDTO answer = answerService.getAnswerByReportId(reportId);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", answer,
                "message", "테스트 상태 변경 완료"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("테스트 상태 변경 실패 (reportId: {}): {}", reportId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "테스트 상태 변경 실패: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * 테스트용: 간단한 답변 생성 API (에러 디버깅용)
     */
    @PostMapping("/test/create-simple")
    public ResponseEntity<Map<String, Object>> testCreateSimpleAnswer(@RequestBody Map<String, Object> request) {
        try {
            log.info("테스트: 간단한 답변 생성 요청: {}", request);
            
            // DTO 변환 없이 직접 테스트
            Long reportId = Long.valueOf(request.get("reportId").toString());
            String content = request.get("content").toString();
            
            log.info("변환된 데이터: reportId={}, content={}", reportId, content);
            
            // AnswerRequestDTO 생성
            AnswerRequestDTO dto = AnswerRequestDTO.builder()
                .reportId(reportId)
                .content(content)
                .build();
            
            log.info("생성된 DTO: {}", dto);
            
            // 서비스 호출
            AnswerResponseDTO created = answerService.createAnswer(dto);
            log.info("답변 생성 성공: answerId={}", created.getAnswerId());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", created,
                "message", "테스트 답변 생성 성공"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("테스트 답변 생성 실패: {}", e.getMessage(), e);
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "테스트 답변 생성 실패: " + e.getMessage(),
                "errorType", e.getClass().getSimpleName()
            );
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
