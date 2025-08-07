package com.gpt.squirrelLogistics.dto.vehicleType;

import lombok.Data;

@Data
public class VehicleTypeRequestDTO {
    private Long adminId; //관리자 아이디.
    private String name; //차량 이름.
    private int maxWeight; //최대 적재량 (kg 단위).
}
