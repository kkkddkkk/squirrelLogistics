package com.gpt.squirrelLogistics.repository.report;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.report.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
	
	//ID로 신고ID 찾기
	@Query("SELECT r.reportId FROM Report r "
			+ "JOIN r.deliveryAssignment d WHERE d.assignedId = :assignedId")
	List<Object[]> findReportById(@Param("assignedId") String assignedId);
	
	@Query("SELECT r.rTitle, r.rContent, r.rStatus FROM Report r "
			+ "WHERE r.reportId = : reportId")
	List<Object[]> findReportContent(@Param("reportId") Long reportId);
}
