package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 기사 검색 요청 DTO
 * 프론트엔드에서 전송하는 검색 조건을 담는 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverSearchRequestDTO {
    private String keyword;           // 검색어 (기사명, 연락처, 지역 등)
    private Boolean drivable;         // 즉시 배차 가능 여부 (Driver.drivable 필드와 일치)
    private Integer maxWeight;        // 최대 적재량 (kg 단위, null이면 필터링 안함)
    private Long vehicleTypeId;       // 차량 종류 ID (Long 타입, null이면 필터링 안함)
    private String sortOption;        // 정렬 기준 (distance: 거리순, rating: 별점순, 빈값: 기본순)
    private Double latitude;          // 현재 위치 위도 (거리순 정렬 시 필요)
    private Double longitude;         // 현재 위치 경도 (거리순 정렬 시 필요)
    private String region;            // 선호 지역 (거리순 정렬 시 기준 주소)
    private Integer page;             // 페이지 번호 (0부터 시작)
    private Integer size;             // 페이지 크기 (기본값: 10)
}
