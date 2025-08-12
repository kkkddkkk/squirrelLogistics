package com.gpt.squirrelLogistics.entity.reportImage;


import com.gpt.squirrelLogistics.entity.report.Report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "report_image")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportImage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "report_image_id")
	private Long reportImageId; //신고이미지 아이디.

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "report_id")
	private Report report; //신고.
	
	private String fileName; //파일 이름.
	private String filePath; //파일 경로.


}
