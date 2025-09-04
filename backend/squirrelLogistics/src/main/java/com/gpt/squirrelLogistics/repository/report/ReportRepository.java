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
	List<Object[]> findReportById(@Param("assignedId") Long assignedId);
	
	//assignedId로 신고내역 찾기
	@Query("SELECT r.rTitle, r.rContent, r.rStatus FROM Report r "
			+ "JOIN r.deliveryAssignment d WHERE d.assignedId = :assignedId")
	List<Object[]> findAllReportById(@Param("assignedId") Long assignedId);
	
	@Query("SELECT r.rTitle, r.rContent, r.rStatus FROM Report r "
			+ "WHERE r.reportId = :reportId")
	List<Object[]> findReportContent(@Param("reportId") Long reportId);
	
	@Query("SELECT r FROM Report r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.deliveryRequest dr "+
			"JOIN dr.company c "+
			"WHERE c.companyId = :companyId "+
			"AND r.reporter = 'COMPANY'")
	List<Report> findByCompanyId(@Param("companyId") Long companyId);
	
	@Query("SELECT r FROM Report r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.driver d "+
			"WHERE d.driverId = :driverId "+
			"AND r.reporter = 'DRIVER'")
	List<Report> findByDriverId(@Param("driverId") Long driverId);
	

}
