package com.gpt.squirrelLogistics.enums.deliveryStatus;

public enum DeliveryStatusEnum {
    ASSIGNED,            // 할당되었지만 미시작
    MOVING_TO_PICKUP,    // 집하처로 이동 중
    PICKUP_COMPLETED,    // 픽업 완료
    MOVING_TO_WAYPOINT,  // 경유지로 이동 중
    ARRIVED_AT_WAYPOINT, // 경유지 도착
    DROPPED_AT_WAYPOINT, // 경유지에 배송 완료
    COMPLETED,           // 전체 배송 완료
    PENDING_PAYMENT,     // 정산 대기
    PAYMENT_COMPLETED,   // 정산 완료
    CANCELED,            // 운송 취소
    ON_HOLD              // 사고 등으로 정지
}
