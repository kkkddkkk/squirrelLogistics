package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointResponseDTO;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeliveryAssignmentSlimResponseDTO {
	private Long assignedId;// 요청 ID
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime assignedAt;//수락 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime completedAt;//종료 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime cancelledAt;//취소일시
	
	private StatusEnum status;//수락 상태
	

	private Long deliveryRequestId;//배송 요청 ID
	private Long paymentId;//결제 ID
	private Long driverId;//운전자 ID
	private Long actualDeliveryId;//실제 운송 ID
	
	//2025-08-13 김도경 수정
	//deliveryRequest
	private String startAddress;//출발지 위치
	private String endAddress;//도착지위치
	
	//waypoint
	private List<DeliveryWaypointResponseDTO> waypoints;//경유지
	private String driverName;//운전자명
	private String profileImageName;//프로필 사진명
	
	//actualDelivery
	private boolean mountainous;//산간지역여부
	private boolean caution;//취급주의여부
	private long actualFee;//총 금액
	
	//vehicleType
	private String carName;//차량이름
	
	//review
	private long reviewId;//리뷰아이디
	private int rating;//평점
	private String reason;//리뷰
	//2025-08-13 김도경 수정 끝.
	
}
