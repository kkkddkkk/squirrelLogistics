package com.gpt.squirrelLogistics.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryListResponseDTO {
    
    // 배송 요청 정보
    private Long requestId;
    private String cargoType;
    private LocalDateTime createAt;  // createdAt -> createAt으로 수정
    private LocalDateTime wantToStart;
    private LocalDateTime wantToEnd;
    
    // 운전자 정보
    private Long driverId;
    private String name;            // User.name에서 가져온 기사명
    
    // 배송 상태
    private String status;          // DeliveryAssignment.status에서 가져온 배송상태
    
    // 결제 정보
    private String payMethod;       // Payment.payMethod에서 가져온 결제방법
    private Long payAmount;         // Payment.pay_amount에서 가져온 예상금액
    private Long actualFee;         // ActualDelivery.actual_fee에서 가져온 실금액
    private Long displayFee;        // 화면에 표시할 금액 (상태에 따라 결정)
    
    // 주소 정보
    private String startAddress;
    private String endAddress;
}
