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
public class PaymentDTO {

	private Long paymentId;// 결제 ID
	
	private Long prepaidId;//사전결제 ID
	private Long payAmount;//결제금액
	private String payMethod;//결제방법
	private String impUid;//아임포트 API 승인번호
	private Long settlementFee;//정산금액
	private boolean settlement;//정산여부

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime paid;//결제완료 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime refundDate;//환불일자
	
	private PayStatusEnum payStatus;//결제상태
	private FailureReasonEnum failureReason;//결제실패사유
	
	

	
}
