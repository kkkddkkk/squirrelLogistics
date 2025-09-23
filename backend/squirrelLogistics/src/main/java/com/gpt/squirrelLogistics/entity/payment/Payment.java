package com.gpt.squirrelLogistics.entity.payment;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.enums.payment.FailureReasonEnum;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "payment")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Payment {//결제
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="payment_id")
	private Long paymentId;// 결제 ID
	
	private Long prepaidId;//사전결제 ID
	private Long payAmount;//결제금액
	private String payMethod;//결제방법
	private Long settlementFee;//정산금액
	private boolean settlement;//정산여부
	private LocalDateTime paid;//결제완료 일시
	private LocalDateTime refundDate;//환불일자
	
	private String impUid;//아임포트 API 승인번호
	
	@Enumerated(EnumType.STRING)
	private PayStatusEnum payStatus;//결제상태
	
	@Enumerated(EnumType.STRING)
	private FailureReasonEnum failureReason;//결제실패사유
	
	
}
