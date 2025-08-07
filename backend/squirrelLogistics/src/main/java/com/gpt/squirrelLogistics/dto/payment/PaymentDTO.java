package com.gpt.squirrelLogistics.dto.payment;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.enums.payment.FailureReasonEnums;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
	private String payId;//결제ID
	private String prepaidId;//사전결제ID
	private String payMethod;//결제방법
	private int payAmount;//결제금액
	private boolean settlement;//정산여부
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate paidDate;//결제완료일시
	
	private PayStatusEnum payStatus;//결제상태
	private FailureReasonEnums failureReason;//결제 실패사유
	

	
}
