package com.gpt.squirrelLogistics.dto.report;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MostReportedDashBoardDTO {
	private Long reportedId;
	private String reportedName; // 신고 당한 사람
	private Long reportCount;
	private String role;

}
