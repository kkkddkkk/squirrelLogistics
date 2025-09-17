package com.gpt.squirrelLogistics.service.driverAuth;

public enum AuthErrorCode {
    UNAUTHORIZED,          // 토큰 없음/깨짐
    TOKEN_INVALID,         // 파싱 실패/만료
    USER_NOT_FOUND,
    NOT_DRIVER,            // 유저 역할이 DRIVER 아님
    NOT_COMPANY,
    NOT_ADMIN,
    DRIVER_NOT_FOUND,      // 유저에 driver 엔티티 연결 없음
    SCHEDULE_CONFLICT,	   // 해당 날짜에 일정 존재
    VEHICLE_TYPE_MISMATCH,   // 해당 기사 보유 차량 요청과 일치하지 않음
    REQUEST_NOT_FOUND,			//해당 아이디의 요청 없음
    REQUEST_ALREADY_TAKEN,
    ALREADY_ACCEPTED,
    UNKNOWN,
    INVALID_STATE,
    
}
