package com.gpt.squirrelLogistics.enums.deliveryAssignment;

public enum StatusEnum {
    ASSIGNED,        // 수락됨, 시작/집하 전.
    IN_PROGRESS,     // 집하 후, 배송 중.
    COMPLETED,       // 배송 완료.
    PAYMENTCOMPLETED,// 정산 완료.
    CANCELED,        // 배송 시작 전, 중도 취소 => 별도 사유 필요.
    FAILED,          // 베송 시작 후, 사고/문제 등으로 실패.
    UNKNOWN			 // 미확인.
}
