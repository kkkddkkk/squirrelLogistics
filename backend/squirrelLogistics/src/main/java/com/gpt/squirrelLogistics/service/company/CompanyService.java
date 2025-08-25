package com.gpt.squirrelLogistics.service.company;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;

public interface CompanyService {
    
    /**
     * userId로부터 companyId 조회
     */
    CompanyResponseDTO getCompanyByUserId(Long userId);
    
    /**
     * 회사 기본 주소 저장 (main_loca)
     */
    String saveMainAddress(Long companyId, String mainLoca);
    
    /**
     * 회사 기본 주소 조회
     */
    String getMainAddress(Long companyId);
    
    /**
     * 회사 기본 주소 삭제
     */
    String deleteMainAddress(Long companyId);
}
