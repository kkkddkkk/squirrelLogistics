package com.gpt.squirrelLogistics.dto.reportImage;


import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportImageSlimResponseDTO {
    private Long reportImageId; //신고 사진 아이디.
    private Long reportResponseId; //신고 정보 개체.
    private String fileName; //파일 이름.
	private String filePath; //파일 경로.

}
