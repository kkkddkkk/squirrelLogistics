package com.gpt.squirrelLogistics.controller.inquiry;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.service.inquiry.InquiryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * Inquiry 전용 Controller
 * 신고/문의 관련 API를 표준 응답 형식으로 제공
 */
@RestController
@RequestMapping("/api/public/inquiry")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Log4j2
public class InquiryController {
    
    private final InquiryService inquiryService;
    
    /**
     * 모든 신고/문의 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getInquiryList() {
        try {
            log.info("신고/문의 목록 조회 요청");
            
            List<Map<String, Object>> inquiries = inquiryService.getAllInquiries();
            log.info("신고/문의 목록 조회 성공: {}개", inquiries.size());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiries,
                "message", "신고/문의 목록을 성공적으로 조회했습니다.",
                "total", inquiries.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "신고/문의 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 특정 신고/문의 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getInquiryById(@PathVariable("id") Long id) {
        try {
            log.info("신고/문의 상세 조회 요청 (ID: {})", id);
            
            Map<String, Object> inquiry = inquiryService.getInquiryById(id);
            log.info("신고/문의 상세 조회 성공 (ID: {})", id);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiry,
                "message", "신고/문의를 성공적으로 조회했습니다."
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("신고/문의 상세 조회 실패 (ID: {}): {}", id, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "신고/문의 상세 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 답변이 있는 신고/문의만 조회
     */
    @GetMapping("/list/with-answers")
    public ResponseEntity<Map<String, Object>> getInquiriesWithAnswers() {
        try {
            log.info("답변 있는 신고/문의 목록 조회 요청");
            
            List<Map<String, Object>> inquiries = inquiryService.getInquiriesWithAnswers();
            log.info("답변 있는 신고/문의 목록 조회 성공: {}개", inquiries.size());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiries,
                "message", "답변 있는 신고/문의 목록을 성공적으로 조회했습니다.",
                "total", inquiries.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("답변 있는 신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 있는 신고/문의 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 답변이 없는 신고/문의만 조회
     */
    @GetMapping("/list/without-answers")
    public ResponseEntity<Map<String, Object>> getInquiriesWithoutAnswers() {
        try {
            log.info("답변 없는 신고/문의 목록 조회 요청");
            
            List<Map<String, Object>> inquiries = inquiryService.getInquiriesWithoutAnswers();
            log.info("답변 없는 신고/문의 목록 조회 성공: {}개", inquiries.size());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiries,
                "message", "답변 없는 신고/문의 목록을 성공적으로 조회했습니다.",
                "total", inquiries.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("답변 없는 신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "답변 없는 신고/문의 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 특정 상태의 신고/문의 조회
     */
    @GetMapping("/list/by-status")
    public ResponseEntity<Map<String, Object>> getInquiriesByStatus(@RequestParam("status") String status) {
        try {
            log.info("상태별 신고/문의 목록 조회 요청 (상태: {})", status);
            
            List<Map<String, Object>> inquiries = inquiryService.getInquiriesByStatus(status);
            log.info("상태별 신고/문의 목록 조회 성공 (상태: {}): {}개", status, inquiries.size());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiries,
                "message", "상태별 신고/문의 목록을 성공적으로 조회했습니다.",
                "total", inquiries.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("상태별 신고/문의 목록 조회 실패 (상태: {}): {}", status, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "상태별 신고/문의 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 특정 카테고리의 신고/문의 조회
     */
    @GetMapping("/list/by-category")
    public ResponseEntity<Map<String, Object>> getInquiriesByCategory(@RequestParam("category") String category) {
        try {
            log.info("카테고리별 신고/문의 목록 조회 요청 (카테고리: {})", category);
            
            List<Map<String, Object>> inquiries = inquiryService.getInquiriesByCategory(category);
            log.info("카테고리별 신고/문의 목록 조회 성공 (카테고리: {}): {}개", category, inquiries.size());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", inquiries,
                "message", "카테고리별 신고/문의 목록을 성공적으로 조회했습니다.",
                "total", inquiries.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("카테고리별 신고/문의 목록 조회 실패 (카테고리: {}): {}", category, e.getMessage(), e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "카테고리별 신고/문의 목록 조회에 실패했습니다: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
