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
public class TransactionStatementDTO {

	private Long paymentId;
	private Long prepaidId;
	
	private Long amount;
	private Long prepaidAmount;
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime paid;//결제완료 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime prepaidPaid;//결제완료 일시

	
}
