package com.gpt.squirrelLogistics.enums.deliveryRequest;

public enum StatusEnum {
	REGISTERED,  // 공개 게시됨.
    PROPOSED,    // 특정 운전자에게 제안됨.
    ASSIGNED,    // 운전자 배차 완료 => DeliveryAssigned로 이관.
    FAILED,      // 매칭 실패 => 기간 경과.
    RETRACTED ,  // 요청자가 요청 내림.
    UNKNOWN		 // 미확인.
}
