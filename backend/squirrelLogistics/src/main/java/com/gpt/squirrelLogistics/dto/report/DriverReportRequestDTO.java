package com.gpt.squirrelLogistics.dto.report;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverReportRequestDTO {
    @JsonProperty("assignedId")
    private long assignedId; //할당 아이디.
    
    private long reportId;//신고ID
    @JsonProperty("reporter")
    private ReportReporterEnum reporter; //신고자.
    
    @JsonProperty("rTitle")
    private String rTitle; //신고 제목.
    
    @JsonProperty("rContent")
    private String rContent; //신고 내용.
    
    @JsonProperty("rStatus")
    private ReportStatusEnum rStatus; //신고 상태.
    
    @JsonProperty("rCate")
    private ReportCategoryEnum rCate; //신고 카테고리.
    private String place; //발생 장소.
}
