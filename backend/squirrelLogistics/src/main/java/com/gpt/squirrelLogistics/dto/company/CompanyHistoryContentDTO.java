package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyHistoryContentDTO {
	private String dropOrder1;
	private String dropOrder2;
	private String dropOrder3;
	
	private boolean mountainous;
	private boolean caution;
	
	private Long actualFee;
	private Long estimatedFee;
	private Long reviewId;
	private int rating;
	private String reason;
	private String driverName;
	private String carName;
	private Long reportId;
	private Long paymentId;
	
	private Long prepaidId;
}
