package com.gpt.squirrelLogistics.dto.actualCalc;

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
public class EstimateCalcDTO {
	private Long distance;
	private Long weight;
	
	private Long dropOrderNum;
	private Long cargoTypeFee;
	private Long estimatedFee;
	
	private Long handlingId;
}
