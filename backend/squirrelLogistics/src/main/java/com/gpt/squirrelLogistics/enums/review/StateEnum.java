package com.gpt.squirrelLogistics.enums.review;

public enum StateEnum {
	  PENDING,          // 등록 대기
	  SUBMITTED,      // 리뷰 등록 완료
	  EDITED,            // 수정됨
	  DELETED,           // 사용자가 삭제
	  ADMIN_DELETED // 운영자에 의한 강제 삭제
}
