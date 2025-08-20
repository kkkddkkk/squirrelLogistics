package com.gpt.squirrelLogistics.entity.report;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "report")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Report {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "report_id")
	private Long reportId; //신고 아이디.

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "delivery_assignment_id")
	private DeliveryAssignment deliveryAssignment; //할당 아이디.

	@Enumerated(EnumType.STRING)
	private ReportReporterEnum reporter; //신고자.
	private String rTitle; //신고 제목.
	private String rContent; //신고 내용.
	
	@Enumerated(EnumType.STRING)
	private ReportStatusEnum rStatus; //신고 상태.
	@Enumerated(EnumType.STRING)
	private ReportCategoryEnum rCate; //신고 카테고리.
	
	private String place; //발생 장소.
	private LocalDateTime regDate; //신고일.
	private LocalDateTime modiDate; //수정일.

	// 수동으로 setter 메서드 추가
	public void setRStatus(ReportStatusEnum rStatus) {
		this.rStatus = rStatus;
	}
	
	public void setModiDate(LocalDateTime modiDate) {
		this.modiDate = modiDate;
	}
	
	// 기타 필요한 setter 메서드들
	public void setRTitle(String rTitle) {
		this.rTitle = rTitle;
	}
	
	public void setRContent(String rContent) {
		this.rContent = rContent;
	}
	
	public void setPlace(String place) {
		this.place = place;
	}
	
	public void setRegDate(LocalDateTime regDate) {
		this.regDate = regDate;
	}
	
	public void setReporter(ReportReporterEnum reporter) {
		this.reporter = reporter;
	}
	
	public void setRCate(ReportCategoryEnum rCate) {
		this.rCate = rCate;
	}

	
	public void setDeliveryAssignment(DeliveryAssignment deliveryAssignment) {
		this.deliveryAssignment = deliveryAssignment;
	}
}
