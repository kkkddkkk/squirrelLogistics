package com.gpt.squirrelLogistics.repository.report;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.report.DetailReportDTO;
import com.gpt.squirrelLogistics.dto.report.MostReportedDTO;
import com.gpt.squirrelLogistics.dto.report.NewestReportsDTO;
import com.gpt.squirrelLogistics.dto.report.ReportCateCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportManagementDTO;
import com.gpt.squirrelLogistics.dto.report.ReportMonthlyCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportStatusCountDTO;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;

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
	
	
	//신고상태별 건수
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.ReportStatusCountDTO(r.rStatus, COUNT(r)) "+
	" FROM Report r GROUP BY r.rStatus")
	List<ReportStatusCountDTO> findStatusCount();
	
	//Pending 상태의 최신 신고(제목, 신고일. 최신순 정렬)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.NewestReportsDTO(r.rTitle, r.regDate) FROM Report r "+
			"WHERE r.rStatus = 'PENDING' "+
			"ORDER BY r.regDate DESC")
	List<NewestReportsDTO> findNewestReports(Pageable pageable);
	
	//가장 많이 신고된 사람(신고된 ID, 신고된 role, 신고건수)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.MostReportedDTO"+
		   "(CASE WHEN r.reporter = 'COMPANY' THEN d.driverId ELSE c.companyId END, " +
	       "COUNT(r), " +
		    "CASE WHEN r.reporter = 'SYSTEM' THEN 'DRIVER' ELSE r.reporter END) " +
			"FROM Report r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.driver d "+
			"JOIN da.deliveryRequest dr "+
			"JOIN dr.company c "+
			"GROUP BY CASE WHEN r.reporter = 'COMPANY' THEN d.driverId ELSE c.companyId END, " +
		    "CASE WHEN r.reporter = 'SYSTEM' THEN 'DRIVER' ELSE r.reporter END " +
			"ORDER BY COUNT(r) DESC")
	List<MostReportedDTO> findMostReported(Pageable pageable);
	
	//가장 많이 신고된 사람(신고된 ID, 신고된 role, 신고건수)(page)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.MostReportedDTO"+
		   "(CASE WHEN r.reporter = 'COMPANY' THEN d.driverId ELSE c.companyId END, " +
	       "COUNT(r), " +
		    "CASE WHEN r.reporter = 'SYSTEM' THEN 'DRIVER' ELSE r.reporter END) " +
			"FROM Report r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.driver d "+
			"JOIN da.deliveryRequest dr "+
			"JOIN dr.company c "+
			"GROUP BY CASE WHEN r.reporter = 'COMPANY' THEN d.driverId ELSE c.companyId END, " +
		    "CASE WHEN r.reporter = 'SYSTEM' THEN 'DRIVER' ELSE r.reporter END " +
			"ORDER BY COUNT(r) DESC")
	Page<MostReportedDTO> findMostReportedPage(Pageable pageable);
	
	//카테고리별 신고건수
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.ReportCateCountDTO(r.rCate, COUNT(r)) "+
	" FROM Report r GROUP BY r.rCate ORDER BY COUNT(r) DESC")
	List<ReportCateCountDTO> findCateCount();
	
	//월별 신고건수(올해만)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.ReportMonthlyCountDTO"+
	"(CAST(FUNCTION('YEAR', r.regDate) AS int), CAST(FUNCTION('MONTH', r.regDate) AS int), COUNT(r)) "+
	"FROM Report r "+
    "WHERE CAST(FUNCTION('YEAR', r.regDate) AS int) = :year " +
	"GROUP BY CAST(FUNCTION('YEAR', r.regDate) AS int), CAST(FUNCTION('MONTH', r.regDate) AS int)")
	List<ReportMonthlyCountDTO> findMonthlyCount(@Param("year") int year);
	
	//신고 확인 게시판(상태, 카테고리, 신고자, 신고일, 제목)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.ReportManagementDTO"+
			"(r.rStatus, r.rCate, r.reportId, "+
			"CASE WHEN r.reporter = 'COMPANY' THEN c.companyId "+
			"WHEN r.reporter = 'DRIVER' THEN d.driverId ELSE -1 END, " +
			"CASE WHEN r.reporter = 'COMPANY' THEN c.user.name "+
			"WHEN r.reporter = 'DRIVER' THEN d.user.name ELSE '시스템' END, " +
			"r.reporter, r.regDate, r.rTitle) FROM Report r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.driver d "+
			"JOIN da.deliveryRequest dr "+
			"JOIN dr.company c "+
			"WHERE (:keyword IS NULL OR :keyword = '' "+
			"OR LOWER(r.rTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) "+
			"OR LOWER(c.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "+
			"OR LOWER(d.user.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) "+
		    "AND (:status IS NULL OR r.rStatus = :status) " +
		    "AND (:cate IS NULL OR r.rCate = :cate) " +
			"ORDER BY r.regDate DESC")
	Page<ReportManagementDTO> findAllReports(Pageable pageable, @Param("keyword") String keyword,
			@Param("status") ReportStatusEnum status, @Param("cate") ReportCategoryEnum cate);
	
	//상세신고(reporterId, reportedId)
	@Query("SELECT new com.gpt.squirrelLogistics.dto.report.DetailReportDTO"+
			   "(CASE WHEN r.reporter = 'COMPANY' THEN c.companyId ELSE d.driverId END, " +
			    "CASE WHEN r.reporter = 'COMPANY' THEN d.driverId ELSE c.companyId END, "+
	    		"r.reporter, r.rTitle, r.rContent, r.regDate) " +
				"FROM Report r "+
				"JOIN r.deliveryAssignment da "+
				"JOIN da.driver d "+
				"JOIN da.deliveryRequest dr "+
				"JOIN dr.company c "+
				"WHERE r.reportId=:reportId")
		List<DetailReportDTO> detailReport(@Param("reportId") Long reportId);

	
}
