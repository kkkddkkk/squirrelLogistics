package com.gpt.squirrelLogistics.dto.vehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleTypeRequestDTO {
    private Long adminId; //관리자 아이디.
    private String name; //차량 이름.
    private int maxWeight; //최대 적재량 (kg 단위).
}
