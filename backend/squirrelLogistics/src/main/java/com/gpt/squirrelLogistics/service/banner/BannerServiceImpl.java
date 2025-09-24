package com.gpt.squirrelLogistics.service.banner;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.dto.banner.BannerRequestDTO;
import com.gpt.squirrelLogistics.dto.banner.CreateBannerDTO;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.banner.Banner;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.car.CarStatusEnum;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.banner.BannerRepository;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.notice.NoticeRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class BannerServiceImpl implements BannerService {
	
	private final BannerRepository bannerRepository;
	private final AdminUserRepository adminUserRepository;
	private final NoticeRepository noticeRepository;

	
	
	@Override
	public List<BannerListDTO> getBannerList() {
		
		return bannerRepository.findAllBannerList();
	}
	
	@Override
	public List<BannerListDTO> getOneBanner(Long bannerId) {
		// TODO Auto-generated method stub
		return bannerRepository.findOneBanner(bannerId);
	}


	@Override
	public Long createBanner(CreateBannerDTO createBannerDTO, Long adminId) {

		
		Banner banner = Banner.builder()
				.adminUser(adminUserRepository.findById(adminId).orElseThrow())
				.imageUrl(createBannerDTO.getImageUrl())
				.notice(noticeRepository.findById(createBannerDTO.getNoticeId()).orElseThrow())
				.title(createBannerDTO.getTitle())
				.subTitle(createBannerDTO.getSubTitle())
				.regDate(LocalDateTime.now())
				.build();
		
		bannerRepository.save(banner);
		bannerRepository.flush();
		return banner.getBannerId();
	}

	@Override
	public void modifyBanner(CreateBannerDTO createBannerDTO, Long adminId, Long bannerId) {
		Banner banner = bannerRepository.findById(bannerId).orElseThrow();
		
		banner.setAdminUser(adminUserRepository.findById(adminId).orElseThrow());
		if (createBannerDTO.getImageUrl() != null && !createBannerDTO.getImageUrl().isEmpty()) {
		    banner.setImageUrl(createBannerDTO.getImageUrl());
		}
		banner.setNotice(noticeRepository.findById(createBannerDTO.getNoticeId()).orElseThrow());
		banner.setTitle(createBannerDTO.getTitle());
		banner.setSubTitle(createBannerDTO.getSubTitle());
		banner.setModiDate(LocalDateTime.now());
		
		bannerRepository.save(banner);
		bannerRepository.flush();
	}

	@Override
	public void deleteBanner(Long bannerId) {
		Banner banner = bannerRepository.findById(bannerId).orElseThrow();
		
		bannerRepository.delete(banner);
	}




} 