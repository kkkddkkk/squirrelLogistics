package com.gpt.squirrelLogistics.dto.car;

import java.time.LocalDateTime;


import com.gpt.squirrelLogistics.enums.car.CarStatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CarSlimResponseDTO {
	private Long carId;//등록차량 ID
	
	private boolean insurance;//차량 보험 여부.
	private String carNum;//차량 번호.
	private Long Mileage;//총 주행거리.
	private String etc;//기타사항.
	
	private LocalDateTime inspection;//차량점검일.
	private LocalDateTime regDate;//등록일.
	private LocalDateTime modiDate;//정보수정일.

	private CarStatusEnum carStatus;//차량상태.

	private Long driverId; //운전자 아이디.
    private Long vehicleTypeId;  //차량 종류 아이디.
}
