package com.gpt.squirrelLogistics.enums.deliveryWaypoint;

public enum StatusEnum {
	PENDING, // 대기 중. 
	ARRIVED, // 도착.
	DROPPED, // 배송 완료.
	SKIPPED, // 건너뜀.
	FAILED,  // 사고, 부재중, 잘못된 주소 등 실패.
	UNKNOWN  // 미확인.
}
