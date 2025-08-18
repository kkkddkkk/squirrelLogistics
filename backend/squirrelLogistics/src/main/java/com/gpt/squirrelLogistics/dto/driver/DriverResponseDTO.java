package com.gpt.squirrelLogistics.dto.driver;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.user.UserDTO;

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
	private String profileImageName;
	private String profileImagePath;
	private String profileImageUrl;
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime LicenseDT;//면허 유효기간

	private UserDTO userDTO;//회원
}
