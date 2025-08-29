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

    private Long paymentId;    // 환불할 결제 건의 id
    private Long amount;      // 환불 금액

}
