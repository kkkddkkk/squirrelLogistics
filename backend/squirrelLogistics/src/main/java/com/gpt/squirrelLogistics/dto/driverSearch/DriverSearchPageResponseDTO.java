package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 기사 검색 페이징 응답 DTO
 * 프론트엔드로 전송되는 페이징된 기사 검색 결과를 담는 객체
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverSearchPageResponseDTO {
    private List<DriverSearchResponseDTO> drivers; // 기사 목록 (현재 페이지의 기사들)
    private int currentPage;          // 현재 페이지 (0부터 시작)
    private int totalPages;           // 전체 페이지 수 (필터링된 결과 기준)
    private long totalElements;       // 전체 기사 수 (필터링된 결과 기준)
    private int pageSize;             // 페이지 크기 (기본값: 10)
    private boolean hasNext;          // 다음 페이지 존재 여부
    private boolean hasPrevious;      // 이전 페이지 존재 여부
}
