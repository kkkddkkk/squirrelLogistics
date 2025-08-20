package com.gpt.squirrelLogistics.dto.payment;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.enums.payment.FailureReasonEnum;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PayBoxDTO {

	private Long requestId;
	private Long paymentId;
	private Long prepaidId;
	
	private Long distance;
	private Long weight;
	
	private boolean dropOrder1;
	private boolean dropOrder2;
	private boolean dropOrder3;
	
	private boolean mountainous;
	private boolean caution;
	private Long estimateFee;
	



	
	

	
}
