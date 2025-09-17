package com.gpt.squirrelLogistics.service.banner;

import java.util.List;

import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;


public interface BannerService {
    
	//배너리스트 조회
    List<BannerListDTO> getBannerList();
    

} 