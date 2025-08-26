package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
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
	
	private String dropOrder1;
	private String dropOrder2;
	private String dropOrder3;
	
	private String startAddress;
	private String endAddress;
	
	private String status;
}
