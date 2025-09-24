package com.gpt.squirrelLogistics.repository.banner;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.entity.banner.Banner;

public interface BannerRepository extends JpaRepository<Banner, Long> {

	// 김도경
	// 모든 bannerList 찾기
	@Query("SELECT new com.gpt.squirrelLogistics.dto.banner.BannerListDTO("
			+ "b.bannerId, b.adminUser.adminId, b.notice.id, b.title, b.subTitle, b.imageUrl) " + "FROM Banner b "+
			"ORDER BY b.regDate ASC")
	List<BannerListDTO> findAllBannerList();
	
	// 김도경
	// 모든 bannerList 하나만 찾기
	@Query("SELECT new com.gpt.squirrelLogistics.dto.banner.BannerListDTO("
			+ "b.bannerId, b.adminUser.adminId, b.notice.id, b.title, b.subTitle, b.imageUrl) " + "FROM Banner b "+
			"WHERE b.bannerId = :bannerId")
	List<BannerListDTO> findOneBanner(@Param("bannerId") Long bannerId);
	

}
