package com.gpt.squirrelLogistics.dto.deliverySchedule;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryScheduleSlimResponseDTO {
	private Long scheduleId; //스케쥴 아이디.
	private Long deliveryAssignmentId; //할당 아이디.

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime scheduleDate; //운송 예약 날짜.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime startTime; //시작 시간.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime endTime; //완료 시간.
}
