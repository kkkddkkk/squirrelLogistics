package com.gpt.squirrelLogistics.entity.report;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.enums.reportCategory.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.reportReporter.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.reportStatus.ReportStatusEnum;

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

}
