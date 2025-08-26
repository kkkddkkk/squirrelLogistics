package com.gpt.squirrelLogistics.dto.driverSchedule;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverScheduleDTO {

	public Long assignedId;//할당 아이디.
	public Long deliveryRequestId;//할당 전 원 요청 아이디.
	public boolean isCompleted;//완료된 일정인지.
	public LocalDateTime wantToStart;//일정 시작일.
	public LocalDateTime wantToEnd;//일정 종료일.
}
