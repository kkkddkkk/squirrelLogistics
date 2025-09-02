package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DetailHistoryDTO {
	private Long assignedId;// 요청 ID
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime wantToStart;//출발일시
	
	private Long driverId;

	//작성자: 고은설
	//기능: 전체 운송의 상태값 전부 조회.
	private List<DeliveryStatusLogSlimResponseDTO> statuses;
	
	//private String dropOrder1;
	//private String dropOrder2;
	//private String dropOrder3;
	private List<DeliveryWaypointSlimResponseDTO> waypoints;
	
	
	//private String startAddress;
	//private String endAddress;
	
	//private String status;
	
	
}
