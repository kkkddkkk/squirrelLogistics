package com.gpt.squirrelLogistics.dto.reportImage;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportImageRequestDTO {

    private int reportId; //신고 아이디.
    private String fileName; //파일 이름.
	private String filePath; //파일 경로.

}
