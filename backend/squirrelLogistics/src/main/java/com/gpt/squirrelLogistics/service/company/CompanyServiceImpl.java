package com.gpt.squirrelLogistics.service.company;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    
    @Override
    public CompanyResponseDTO getCompanyByUserId(Long userId) {
        try {
            // userId로 User 조회
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }
            
            // User의 Company 조회
            Company company = user.getCompany();
            if (company == null) {
                return null;
            }
            
            // CompanyResponseDTO로 변환
            return CompanyResponseDTO.builder()
                .companyId(company.getCompanyId())
                .address(company.getAddress())
                .mainLoca(company.getMainLoca())
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    
    
    @Override
    @Transactional
    public String saveMainAddress(Long companyId, String mainLoca) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(mainLoca);
            companyRepository.save(company);
            
            return "기본 주소가 저장되었습니다: " + mainLoca;
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 저장 실패: " + e.getMessage());
        }
    }
    
    @Override
    public String getMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            return company.getMainLoca();
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 조회 실패: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public String deleteMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(null);
            companyRepository.save(company);
            
            return "기본 주소가 삭제되었습니다.";
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 삭제 실패: " + e.getMessage());
        }
    }
}
