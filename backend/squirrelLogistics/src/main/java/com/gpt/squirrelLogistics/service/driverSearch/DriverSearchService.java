package com.gpt.squirrelLogistics.service.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchResponseDTO;

import java.util.List;

public interface DriverSearchService {
    
    /**
     * 기사 검색 (필터링, 정렬 포함)
     */
    List<DriverSearchResponseDTO> searchDrivers(DriverSearchRequestDTO request);
}
