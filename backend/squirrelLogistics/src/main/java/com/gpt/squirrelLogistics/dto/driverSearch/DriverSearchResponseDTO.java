package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverSearchResponseDTO {
    // Driver에서 가져올 정보
    private Long driverId;
    private String mainLoca; // 선호 지역
    private Boolean drivable; // 즉시 배차 가능 여부
    private String profileImageUrl;
    
    // VehicleType에서 가져올 정보
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private Integer maxWeight; // 최대 적재량 (kg)
    
    // Car에서 가져올 정보
    private Boolean insurance; // 보험 여부
    
    // Review에서 계산된 평균 평점
    private Double averageRating;
    
    // 거리 계산을 위한 좌표 (선택사항)
    private Double latitude;
    private Double longitude;
}
