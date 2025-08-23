package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverSearchPageResponseDTO {
    private List<DriverSearchResponseDTO> drivers; // 기사 목록
    private int currentPage; // 현재 페이지 (0부터 시작)
    private int totalPages; // 전체 페이지 수
    private long totalElements; // 전체 기사 수
    private int pageSize; // 페이지 크기
    private boolean hasNext; // 다음 페이지 존재 여부
    private boolean hasPrevious; // 이전 페이지 존재 여부
}
