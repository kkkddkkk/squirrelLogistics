package com.gpt.squirrelLogistics.service.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchPageResponseDTO;

public interface DriverSearchService {
    
    /**
     * 기사 검색 (필터링, 정렬, 페이징 포함)
     */
    DriverSearchPageResponseDTO searchDrivers(DriverSearchRequestDTO request);
    
    /**
     * 기사 통계 정보 조회
     */
    Object getDriverStats();
    
    /**
     * 기사 검색 히스토리 저장
     */
    Object saveSearchHistory(DriverSearchRequestDTO request);
    
    /**
     * 위치 기반 기사 검색
     */
    Object searchDriversByLocation(DriverSearchRequestDTO request);
}
