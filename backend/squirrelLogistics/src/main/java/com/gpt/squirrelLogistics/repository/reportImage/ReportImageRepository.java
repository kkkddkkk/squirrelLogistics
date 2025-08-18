package com.gpt.squirrelLogistics.repository.reportImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.reportImage.ReportImage;

public interface ReportImageRepository extends JpaRepository<ReportImage, Long> {
	//신고ID로 이미지 모두 찾기
	@Query("SELECT ri.fileName FROM ReportImage ri "
			+ "JOIN ri.report r WHERE r.reportId = :reportId")
	List<String> findImgsByReportId(@Param("reportId") Long reportId);
}
