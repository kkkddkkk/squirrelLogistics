package com.gpt.squirrelLogistics.service.banner;

import java.util.List;

import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.dto.banner.BannerRequestDTO;
import com.gpt.squirrelLogistics.dto.banner.CreateBannerDTO;


public interface BannerService {
    
	//배너리스트 조회
    List<BannerListDTO> getBannerList();
    
    //배너 조회
    List<BannerListDTO> getOneBanner(Long bannerId);
    
    //배너 생성
    Long createBanner(CreateBannerDTO createBannerDTO, Long adminId);
    
    //배너 수정
    void modifyBanner(CreateBannerDTO createBannerDTO, Long adminId, Long bannerId);  
    
    //배너 삭제
    void deleteBanner(Long bannerId);

} 