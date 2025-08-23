package com.gpt.squirrelLogistics.service.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchPageResponseDTO;

public interface DriverSearchService {
    
    /**
     * 기사 검색 (필터링, 정렬, 페이징 포함)
     */
    DriverSearchPageResponseDTO searchDrivers(DriverSearchRequestDTO request);
}
