package com.gpt.squirrelLogistics.dto.deliveryRequest;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryRequestRequestDTO {
	private Long requestId;// 요청 ID
	
	private String startAddress;//출발지 위치
	private String endAddress;//도착지 위치
	private String memoToDriver;//배송 요청 메모
	private int totalCargoCount;//총 화물 수
	private int totalCargoWeight;//총 화물 무게
	private Long estimatedFee;//예상금액
	private Long distance;//거리
	
	private LocalDateTime createAt;//요청 등록 시간
	private LocalDateTime wantToStart;//희망 시작일
	private LocalDateTime wantToEnd;//희망 종료일
	
	private String expectedPolyline;//예상 폴리라인
	private String expectedRoute;//예상 경로
	
	private StatusEnum status;//요청 상태

	private Long paymentId;//결제
	private Long companyId;//물류회사
	private Long vehicleTypeId;//차량 종류
}
