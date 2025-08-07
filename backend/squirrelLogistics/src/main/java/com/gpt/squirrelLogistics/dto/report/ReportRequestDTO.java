package com.gpt.squirrelLogistics.dto.report;

import com.gpt.squirrelLogistics.enums.reportCategory.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.reportReporter.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.reportStatus.ReportStatusEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequestDTO {

    private int assigned_id; //할당 아이디.
    private ReportReporterEnum reporter; //신고자.
    private String rTitle; //신고 제목.
    private String rContent; //신고 내용.
    private ReportStatusEnum rStatus; //신고 상태.
    private ReportCategoryEnum rCate; //신고 카테고리.
    private String place; //발생 장소.
}
