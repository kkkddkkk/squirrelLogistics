package com.gpt.squirrelLogistics.dto.vehicleType;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleTypeResponseDTO {
    private Long vehicleTypeId; //차량 종류 아이디.
    private AdminUserResponseDTO adminUserDTO; //관리자 정보 객체.
    private String name; //차량 이름.         
    private int maxWeight; //최대 적재량 kg단위.
    
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;  //등록일.
}
