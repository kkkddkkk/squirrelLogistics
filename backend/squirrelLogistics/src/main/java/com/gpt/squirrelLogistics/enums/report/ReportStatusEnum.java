package com.gpt.squirrelLogistics.enums.report;

public enum ReportStatusEnum {
    PENDING,        // 신고 접수 대기
    IN_REVIEW,      // 검토 중
    ACTION_TAKEN,   // 조치 완료
    REJECTED,       // 신고 반려
    CLOSED          // 상황종료
}
