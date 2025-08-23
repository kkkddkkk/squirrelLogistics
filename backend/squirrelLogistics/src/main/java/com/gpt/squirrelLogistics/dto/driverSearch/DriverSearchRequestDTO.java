package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverSearchRequestDTO {
    private String keyword;           // 검색어
    private Boolean drivable;         // 즉시 배차 가능 여부 (Driver.drivable 필드와 일치)
    private Integer maxWeight;        // 최대 적재량
    private Long vehicleTypeId;       // 차량 종류 ID (Long 타입)
    private String sortOption;        // 정렬 기준 (distance, rating)
    private Double latitude;          // 현재 위치 위도
    private Double longitude;         // 현재 위치 경도
    private String region;            // 선호 지역
    private Integer page;             // 페이지 번호
    private Integer size;             // 페이지 크기
}
