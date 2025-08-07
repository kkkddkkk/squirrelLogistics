package com.gpt.squirrelLogistics.dto.reportImage;

import com.gpt.squirrelLogistics.enums.reportCategory.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.reportReporter.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.reportStatus.ReportStatusEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportImageRequestDTO {

    private int reportId; //신고 아이디.
    private String fileName; //파일 이름.
}
