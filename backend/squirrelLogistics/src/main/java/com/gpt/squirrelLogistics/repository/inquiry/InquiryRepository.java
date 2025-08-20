package com.gpt.squirrelLogistics.repository.inquiry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.answer.Answer;

/**
 * Inquiry 전용 Repository
 * 기존 Report와 Answer 데이터를 Inquiry 형태로 조회하기 위한 래퍼
 */
@Repository
public interface InquiryRepository extends JpaRepository<Report, Long> {
    
    /**
     * 모든 신고/문의 목록을 최신순으로 조회
     */
    @Query("SELECT r FROM Report r ORDER BY r.regDate DESC")
    List<Report> findAllInquiriesOrderByDate();
    
    /**
     * 특정 신고/문의에 대한 답변 조회
     */
    @Query("SELECT a FROM Answer a WHERE a.report.reportId = :reportId")
    Optional<Answer> findAnswerByReportId(@Param("reportId") Long reportId);
    
    /**
     * 답변이 있는 신고/문의만 조회
     */
    @Query("SELECT r FROM Report r WHERE EXISTS (SELECT a FROM Answer a WHERE a.report = r) ORDER BY r.regDate DESC")
    List<Report> findInquiriesWithAnswers();
    
    /**
     * 답변이 없는 신고/문의만 조회
     */
    @Query("SELECT r FROM Report r WHERE NOT EXISTS (SELECT a FROM Answer a WHERE a.report = r) ORDER BY r.regDate DESC")
    List<Report> findInquiriesWithoutAnswers();
    
    /**
     * 특정 상태의 신고/문의 조회
     */
    @Query("SELECT r FROM Report r WHERE r.rStatus = :status ORDER BY r.regDate DESC")
    List<Report> findInquiriesByStatus(@Param("status") String status);
    
    /**
     * 특정 카테고리의 신고/문의 조회
     */
    @Query("SELECT r FROM Report r WHERE r.rCate = :category ORDER BY r.regDate DESC")
    List<Report> findInquiriesByCategory(@Param("category") String category);
}
