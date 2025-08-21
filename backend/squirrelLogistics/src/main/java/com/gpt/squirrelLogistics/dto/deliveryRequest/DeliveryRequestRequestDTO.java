package com.gpt.squirrelLogistics.dto.deliveryRequest;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
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

	private String startAddress;// 출발지 위치
	private String endAddress;// 도착지 위치
	private String memoToDriver;// 배송 요청 메모
	private int totalCargoCount;// 총 화물 수
	private int totalCargoWeight;// 총 화물 무게
	private Long estimatedFee;// 예상금액
	private Long distance;// 예상 거리

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createAt;// 요청 등록 시간
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime wantToStart;// 희망 시작일
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime wantToEnd;// 희망 종료일

	private String expectedPolyline;// 예상 폴리라인
	private String expectedRoute;// 예상 경로

	private StatusEnum status;// 요청 상태

	private Long paymentId;// 결제
	private Long companyId;// 물류회사
	private Long vehicleTypeId;// 차량 종류

	// 경유지 목록 추가 (고은설 08.13)
	private List<DeliveryWaypointRequestDTO> waypoints;
	
	
	// 추가: 요청 단위의 화물 취급유형들(문자열 태그 리스트 정윤진 08.21)
    private List<String> cargoTypes;
}
