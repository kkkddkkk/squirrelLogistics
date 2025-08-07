package com.gpt.squirrelLogistics.enums.payment;

public enum FailureReasonEnums {
    CARD_DECLINED,         // 카드 거절
    INSUFFICIENT_FUNDS,    // 잔액 부족
    EXPIRED_CARD,          // 카드 만료
    INVALID_CARD_NUMBER,   // 카드 번호 오류
    PAYMENT_GATEWAY_ERROR, // 결제 게이트웨이 오류
    USER_CANCELLED,        // 사용자가 결제 취소
    FRAUD_SUSPECTED,       // 부정 사용 의심
    NETWORK_ERROR,         // 네트워크 오류
    UNKNOWN_ERROR          // 알 수 없는 오류
}
