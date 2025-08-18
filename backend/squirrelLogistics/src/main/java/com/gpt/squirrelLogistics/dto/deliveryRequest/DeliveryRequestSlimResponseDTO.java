package com.gpt.squirrelLogistics.dto.deliveryRequest;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryRequestSlimResponseDTO {
	private Long requestId;// 요청 ID

	private String startAddress;// 출발지 위치
	private String endAddress;// 도착지 위치
	private String memoToDriver;// 배송 요청 메모
	private int totalCargoCount;// 총 화물 수
	private int totalCargoWeight;// 총 화물 무게
	private Long estimatedFee;// 예상금액
	private Long distance;// 거리
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createAt;// 요청 등록 시간
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime wantToStart;// 희망 시작일
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime wantToEnd;// 희망 종료일

	private StatusEnum status;// 요청 상태

	private Long paymentId;// 결제 ID
	private Long companyId;// 물류회사 ID
	
	private Long vehicleTypeId;// 차량 종류 ID
	
	// 차량 종류 이름 추가 (고은설 08.13)
	private String vehicleTypeName;
	// 물류회사 이름 추가 (고은설 08.13)
	private String companyName;
	// 물류회사 주소 추가 (고은설 08.13)
	private String companyAddress;

}
