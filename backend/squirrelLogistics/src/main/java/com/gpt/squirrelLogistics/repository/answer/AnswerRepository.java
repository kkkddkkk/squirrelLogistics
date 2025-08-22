package com.gpt.squirrelLogistics.repository.answer;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.answer.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
	
	// reportId로 답변 조회
	@Query("SELECT a FROM Answer a WHERE a.report.reportId = :reportId")
	List<Answer> findByReportId(@Param("reportId") Long reportId);
	
	// reportId로 답변 개수 조회
	@Query("SELECT COUNT(a) FROM Answer a WHERE a.report.reportId = :reportId")
	long countByReportId(@Param("reportId") Long reportId);
}
