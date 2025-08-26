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
public class RefundDTO {

    private String impUid;    // 환불할 결제 건의 imp_uid
    private Long amount;      // 환불 금액
    private String reason;    // 환불 사유

}
