package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyHistoryContentWhenAssignedDTO {
	private String dropOrder1;
	private String dropOrder2;
	private String dropOrder3;
	
	private boolean mountainous;
	private boolean caution;
	
	private Long estimatedFee;
	private String driverName;
	private String carName;
	private Long reportId;
	private Long paymentId;
}
