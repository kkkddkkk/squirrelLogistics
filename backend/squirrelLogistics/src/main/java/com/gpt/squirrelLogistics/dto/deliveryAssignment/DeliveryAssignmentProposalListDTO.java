package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
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
public class DeliveryAssignmentProposalListDTO {

	private Long assignedId;// 할당 ID
	private Long requestId;//요청 ID

	private String startAddress;// 출발지 위치
	private String endAddress;// 도착지위치
	private Long distance;// 총 거리

	private Long estimatedFee;// 예상 금액
	private LocalDateTime refundDate; //요청 취소일
	private String companyUserName;// 요청 물류회사

}
