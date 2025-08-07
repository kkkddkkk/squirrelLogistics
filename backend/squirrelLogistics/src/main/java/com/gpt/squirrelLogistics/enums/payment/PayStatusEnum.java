package com.gpt.squirrelLogistics.enums.payment;

public enum PayStatusEnum {
    PENDING,      // 결제 대기 중 (사용자가 결제 진행 전 상태)
    PROCESSING,   // 결제 처리 중 (결제 시도 중)
    COMPLETED,    // 결제 완료
    FAILED,       // 결제 실패
    CANCELLED,    // 결제 취소됨
    REFUNDED     // 환불 완료
}
