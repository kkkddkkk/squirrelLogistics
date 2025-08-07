package com.gpt.squirrelLogistics.dto.cargoType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CargoTypeDTO {
	private Long handlingId;//취급유형 ID
	
	private String handlingTags;//취급유형
	private Long extraFee;//추가금
}
