package com.gpt.squirrelLogistics.service.inquiry;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.entity.answer.Answer;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.repository.inquiry.InquiryRepository;
import com.gpt.squirrelLogistics.repository.answer.AnswerRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * Inquiry 전용 Service
 * Report와 Answer 데이터를 Inquiry 형태로 변환하고 관리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class InquiryService {
    
    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final AnswerRepository answerRepository;
    
    /**
     * 모든 신고/문의 목록 조회 (Inquiry 형태로 변환)
     */
    public List<Map<String, Object>> getAllInquiries() {
        try {
            log.info("신고/문의 목록 조회 시작");
            
            // 더 안전한 방법으로 Report 조회
            List<Report> reports = reportRepository.findAll();
            log.info("전체 Report 조회 성공: {}개", reports.size());
            
            // 최신순으로 정렬
            reports.sort((r1, r2) -> {
                if (r1.getRegDate() == null && r2.getRegDate() == null) return 0;
                if (r1.getRegDate() == null) return 1;
                if (r2.getRegDate() == null) return -1;
                return r2.getRegDate().compareTo(r1.getRegDate());
            });
            
            log.info("정렬 완료, 변환 시작");
            
            return reports.stream()
                .map(this::convertToInquiryMap)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("신고/문의 목록 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 특정 신고/문의 상세 조회 (Inquiry 형태로 변환)
     */
    public Map<String, Object> getInquiryById(Long inquiryId) {
        try {
            log.info("신고/문의 상세 조회 시작 (ID: {})", inquiryId);
            
            Report report = reportRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("신고/문의를 찾을 수 없습니다: " + inquiryId));
            
            // 답변 데이터 조회 (더 안전한 방법)
            Optional<Answer> answerOpt = Optional.empty();
            try {
                answerOpt = inquiryRepository.findAnswerByReportId(inquiryId);
            } catch (Exception e) {
                log.warn("답변 조회 중 오류 발생 (ID: {}): {}", inquiryId, e.getMessage());
                // 답변 조회 실패해도 신고/문의는 반환
            }
            
            Map<String, Object> inquiryMap = convertToInquiryDetailMap(report, answerOpt.orElse(null));
            log.info("신고/문의 상세 조회 완료 (ID: {})", inquiryId);
            
            return inquiryMap;
            
        } catch (Exception e) {
            log.error("신고/문의 상세 조회 실패 (ID: {}): {}", inquiryId, e.getMessage(), e);
            throw new RuntimeException("신고/문의 상세 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 답변이 있는 신고/문의만 조회
     */
    public List<Map<String, Object>> getInquiriesWithAnswers() {
        try {
            log.info("답변 있는 신고/문의 목록 조회 시작");
            
            List<Report> reports = inquiryRepository.findInquiriesWithAnswers();
            log.info("답변 있는 신고/문의 수: {}", reports.size());
            
            return reports.stream()
                .map(this::convertToInquiryMap)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("답변 있는 신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("답변 있는 신고/문의 목록 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 답변이 없는 신고/문의만 조회
     */
    public List<Map<String, Object>> getInquiriesWithoutAnswers() {
        try {
            log.info("답변 없는 신고/문의 목록 조회 시작");
            
            List<Report> reports = inquiryRepository.findInquiriesWithoutAnswers();
            log.info("답변 없는 신고/문의 수: {}", reports.size());
            
            return reports.stream()
                .map(this::convertToInquiryMap)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("답변 없는 신고/문의 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("답변 없는 신고/문의 목록 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 특정 상태의 신고/문의 조회
     */
    public List<Map<String, Object>> getInquiriesByStatus(String status) {
        try {
            log.info("상태별 신고/문의 목록 조회 시작 (상태: {})", status);
            
            List<Report> reports = inquiryRepository.findInquiriesByStatus(status);
            log.info("상태 '{}'인 신고/문의 수: {}", status, reports.size());
            
            return reports.stream()
                .map(this::convertToInquiryMap)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("상태별 신고/문의 목록 조회 실패 (상태: {}): {}", status, e.getMessage(), e);
            throw new RuntimeException("상태별 신고/문의 목록 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 특정 카테고리의 신고/문의 조회
     */
    public List<Map<String, Object>> getInquiriesByCategory(String category) {
        try {
            log.info("카테고리별 신고/문의 목록 조회 시작 (카테고리: {})", category);
            
            List<Report> reports = inquiryRepository.findInquiriesByCategory(category);
            log.info("카테고리 '{}'인 신고/문의 수: {}", category, reports.size());
            
            return reports.stream()
                .map(this::convertToInquiryMap)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("카테고리별 신고/문의 목록 조회 실패 (카테고리: {}): {}", category, e.getMessage(), e);
            throw new RuntimeException("카테고리별 신고/문의 목록 조회에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * Report를 Inquiry 형태의 Map으로 변환 (목록용)
     */
    private Map<String, Object> convertToInquiryMap(Report report) {
        try {
            Map<String, Object> inquiryMap = new HashMap<>();
            
            // null 체크 강화
            inquiryMap.put("id", report.getReportId() != null ? report.getReportId() : 0L);
            inquiryMap.put("title", report.getRTitle() != null ? report.getRTitle() : "");
            inquiryMap.put("content", report.getRContent() != null ? report.getRContent() : "");
            inquiryMap.put("status", report.getRStatus() != null ? report.getRStatus() : "미처리");
            inquiryMap.put("category", report.getRCate() != null ? report.getRCate() : "");
            inquiryMap.put("reporter", report.getReporter() != null ? report.getReporter() : "사용자");
            inquiryMap.put("createdAt", report.getRegDate() != null ? report.getRegDate() : null);
            inquiryMap.put("updatedAt", report.getModiDate() != null ? report.getModiDate() : null);
            
            log.debug("Report ID {} 변환 완료", report.getReportId());
            return inquiryMap;
            
        } catch (Exception e) {
            log.error("Report 변환 중 오류 발생 (ID: {}): {}", report.getReportId(), e.getMessage());
            // 기본값으로 반환
            Map<String, Object> fallbackMap = new HashMap<>();
            fallbackMap.put("id", 0L);
            fallbackMap.put("title", "변환 오류");
            fallbackMap.put("content", "데이터 변환 중 오류가 발생했습니다.");
            fallbackMap.put("status", "오류");
            fallbackMap.put("category", "");
            fallbackMap.put("reporter", "알 수 없음");
            fallbackMap.put("createdAt", null);
            fallbackMap.put("updatedAt", null);
            return fallbackMap;
        }
    }
    
    /**
     * Report와 Answer를 Inquiry 상세 형태의 Map으로 변환
     */
    private Map<String, Object> convertToInquiryDetailMap(Report report, Answer answer) {
        Map<String, Object> inquiryMap = convertToInquiryMap(report);
        
        if (answer != null) {
            Map<String, Object> answerMap = new HashMap<>();
            answerMap.put("id", answer.getAnswerId());
            answerMap.put("content", answer.getContent() != null ? answer.getContent() : "");
            answerMap.put("createdAt", answer.getRegDate());
            answerMap.put("updatedAt", answer.getModiDate());
            inquiryMap.put("answer", answerMap);
        }
        
        return inquiryMap;
    }
}
