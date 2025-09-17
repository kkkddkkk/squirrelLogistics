package com.gpt.squirrelLogistics.repository.banner;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.entity.banner.Banner;

public interface BannerRepository extends JpaRepository<Banner, Long> {
	
	//김도경
	//모든 bannerList 찾기
	@Query("SELECT b.bannerId, b.adminUser.adminId, b.notice.id, b.title, b.subTitle, b.imageUrl FROM Banner b")
	List<BannerListDTO> findAllBannerList();
	
//	private Long bannerId; //배너 아이디.
//	private Long adminId;//관리자Id
//	private Long noticeId;//공지Id
//	private String title; //제목.
//	private String subTitle;//부제목
//	private String imageUrl; //이미지 경로.
}
