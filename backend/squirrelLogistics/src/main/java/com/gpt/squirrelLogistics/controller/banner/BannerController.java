package com.gpt.squirrelLogistics.controller.banner;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gpt.squirrelLogistics.controller.answer.AnswerController.RequestAnswerDto;
import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.dto.banner.CreateBannerDTO;
import com.gpt.squirrelLogistics.gitImageUpload.GitHubUploader;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.service.banner.BannerService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/banner")
public class BannerController {

	private final FindUserByTokenService findUserByTokenService;
	private final BannerService bannerService;
	private final AdminUserRepository adminUserRepository;
	private final String uploadDir = new File("uploads").getAbsolutePath() + "/banner/";
	private final GitHubUploader gitHubUploader;

	@Getter
	@Setter
	@AllArgsConstructor
	public class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;
	}

	@GetMapping("/list")
	@TimedEndpoint("getBannerList") // clear
	public ResponseEntity<ApiResponse<List<BannerListDTO>>> getBannerList(
			@RequestHeader("Authorization") String token) {
		List<BannerListDTO> list = bannerService.getBannerList();

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", list));
	}

	@GetMapping
	@TimedEndpoint("getBannerList") // clear
	public ResponseEntity<ApiResponse<BannerListDTO>> getOneBanner(@RequestHeader("Authorization") String token,
			@RequestParam("bannerId") Long bannerId) {
		BannerListDTO list = bannerService.getOneBanner(bannerId).get(0);

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", list));
	}

	@PostMapping
	@TimedEndpoint("createBanner") // clear
	public Map<String, Long> createBanner(@RequestHeader("Authorization") String token,
			@RequestPart("imageFile") MultipartFile img, @RequestParam("title") String title,
			@RequestParam("subTitle") String subTitle, @RequestParam("noticeId") Long noticeId) {

		try {
			// GitHub 업로드 -> raw Url 얻기
			String rawUrl = gitHubUploader.uploadImage(img.getBytes(), img.getOriginalFilename());

			String filePath = uploadDir + img.getOriginalFilename();
			File dest = new File(filePath);
			dest.getParentFile().mkdirs(); // 폴더 없으면 생성
			img.transferTo(dest);

			Long userId = findUserByTokenService.getUserIdByToken(token);
			Long adminId = adminUserRepository.findAdminIdByUserId(userId).orElseThrow();

//			CreateBannerDTO dto = CreateBannerDTO.builder().imageUrl(img.getOriginalFilename()).title(title)
//					.subTitle(subTitle).noticeId(noticeId).build();
			// 파일명이 아니라 raw URL 저장
			CreateBannerDTO dto = CreateBannerDTO.builder().imageUrl(rawUrl).title(title).subTitle(subTitle)
					.noticeId(noticeId).build();

			Long bannerId = bannerService.createBanner(dto, adminId);

			return Map.of("bannerId", bannerId);
		} catch (Exception e) {
			return Map.of("failed", -1L);
		}
	}

	@PostMapping("/modify")
	@TimedEndpoint("modifyBanner") // clear
	public Map<String, Long> modifyBanner(@RequestHeader("Authorization") String token,
			@RequestPart(value = "imageFile", required = false) MultipartFile img, // optional
			@RequestParam("title") String title, @RequestParam("subTitle") String subTitle,
			@RequestParam("noticeId") Long noticeId, @RequestParam("bannerId") Long bannerId) {

		try {
			String imageUrl = null;
			if (img != null && !img.isEmpty()) {
//				String filePath = uploadDir + img.getOriginalFilename();
//				File dest = new File(filePath);
//				dest.getParentFile().mkdirs();
//				img.transferTo(dest);
//				imageUrl = img.getOriginalFilename();
				
				// 새 이미지 업로드 시에만 갱신
                imageUrl = gitHubUploader.uploadImage(img.getBytes(), img.getOriginalFilename());
			}

			Long userId = findUserByTokenService.getUserIdByToken(token);
			Long adminId = adminUserRepository.findAdminIdByUserId(userId).orElseThrow();

			CreateBannerDTO dto = CreateBannerDTO.builder().imageUrl(imageUrl).title(title).subTitle(subTitle)
					.noticeId(noticeId).build();

			bannerService.modifyBanner(dto, adminId, bannerId);

			return Map.of("bannerId", bannerId);
		} catch (Exception e) {
			e.printStackTrace();
			return Map.of("failed", -1L);
		}
	}

	@DeleteMapping
	@TimedEndpoint("deleteBanner")
	public void modifyBanner(@RequestHeader("Authorization") String token, @RequestParam("bannerId") Long bannerId) {

		bannerService.deleteBanner(bannerId);
	}

}
