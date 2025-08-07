package com.gpt.squirrelLogistics.dto.driver;

import com.gpt.squirrelLogistics.entity.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverResponseDTO {
	private Long driverId;//운전자 ID
	
	private String mainLoca;//선호지역
	private String licenseNum;//운전면허번호
	private boolean drivable;//운전 가능 여부

	private User user;//회원
}
