package com.gpt.squirrelLogistics.controller.banner;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gpt.squirrelLogistics.controller.banner.BannerController.ApiResponse;
import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.service.banner.BannerService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/banner")
public class BannerPublicController {
    private final String uploadDir = new File("uploads").getAbsolutePath() + "/banner/";
    private final BannerService bannerService;
    
	@Getter
	@Setter
	@AllArgsConstructor
	public class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;
	}

    // 파일 불러오기
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable("fileName") String filename) throws IOException {
        Path path = Paths.get(uploadDir + filename);
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // png면 IMAGE_PNG
                .body(resource);
    }
    
    //배너리스트
	@GetMapping("/list")
	@TimedEndpoint("getBannerList") // clear
	public ResponseEntity<ApiResponse<List<BannerListDTO>>> getBannerList() {
		List<BannerListDTO> list = bannerService.getBannerList();

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", list));
	}
}
