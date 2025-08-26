package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportForListDTO {

    private long reportId;//신고ID
    private String rTitle; //신고 제목.
    private String rContent; //신고 내용.
    private ReportStatusEnum rStatus; //신고 상태.
    private ReportCategoryEnum rCate; //신고 카테고리.
    
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //신고일.
	
	private String startAddress;
	private String endAddress;
	private String[] fileNames;

}
