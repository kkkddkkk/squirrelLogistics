package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverSearchRequestDTO {
    // 검색 조건
    private String keyword; // 검색어
    
    // 필터링 조건
    private Boolean isImmediate; // 즉시 배차 여부
    private Integer maxWeight; // 최대 적재량
    private Long vehicleTypeId; // 차량 종류 ID
    
    // 정렬 기준
    private String sortOption; // "distance" 또는 "rating"
    
    // 거리 계산을 위한 좌표
    private Double latitude;
    private Double longitude;
    private String region; // 설정한 지역
}
