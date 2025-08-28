package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverDeliveryHistoryDTO {
	//작성자: 고은설
	//기능: 완료된 운송 기록건에 대한 상세 페이지 구현.
	
	private Long assignedId;// 요청 ID
	private String requestCompantName;
	
	//실제 이동 관련.
	private String actualPolyLine;
	private Long actualDistance;
	
	//경유지 관련.
	List<DeliveryWaypointSlimResponseDTO> waypoints;
	
	//운송 상태 관련.
	List<DeliveryStatusLogSlimResponseDTO> logs;
	
	
	//정산 관련.
	private Long prePaidFee;
	private Long postPaidFee;
	private PayStatusEnum paymentStatus;

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime payedAt;

}
