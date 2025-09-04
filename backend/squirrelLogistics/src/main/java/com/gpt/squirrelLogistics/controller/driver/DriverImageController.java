package com.gpt.squirrelLogistics.controller.driver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/driverImage")
public class DriverImageController {
    private final String uploadDir = new File("uploads").getAbsolutePath() + "/profile/";
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
	private final FindUserByTokenService findUserByTokenService;
	
    // 파일 불러오기
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable("fileName") String fileName) throws IOException {

        Path path = Paths.get(uploadDir + fileName);
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // png면 IMAGE_PNG
                .body(resource);
    }
    
    
    @PutMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestHeader("Authorization")String token) {
        try {
        	
        	// 원본 파일명 가져오기
        	String originalFilename = file.getOriginalFilename();

        	// 확장자 추출
        	String extension = "";
        	int i = originalFilename.lastIndexOf('.');
        	if (i > 0) {
        	    extension = originalFilename.substring(i); // .jpg, .png 등
        	}

        	// 랜덤 파일명 생성
        	String randomFilename = UUID.randomUUID().toString() + extension;
        	
            // 저장할 경로
            String filePath = uploadDir + randomFilename;
            File dest = new File(filePath);
            dest.getParentFile().mkdirs(); // 폴더 없으면 생성
            file.transferTo(dest);
            
    		Long userId = findUserByTokenService.getUserIdByToken(token);
            Long driverId = driverRepository.findDriverIdByUserId(userId);
            
            Driver driver = driverRepository.findById(driverId).orElseThrow();
            
            //기존 사진 삭제
            String oldPath = driver.getProfileImagePath();
            if (oldPath != null) {
                File oldFile = new File(oldPath);
                if (oldFile.exists()) oldFile.delete();
            }
            //새사진 set
            driver.setProfileImageName(randomFilename);
            driver.setProfileImagePath(filePath);
            driver.setProfileImageUrl("/api/public/driverImage/"+randomFilename);
            driverRepository.save(driver);

            // DB에는 file.getOriginalFilename()만 저장하면 됨
            return ResponseEntity.ok(randomFilename);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
