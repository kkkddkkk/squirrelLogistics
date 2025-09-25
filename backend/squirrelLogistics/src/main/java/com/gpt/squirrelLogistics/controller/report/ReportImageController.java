package com.gpt.squirrelLogistics.controller.report;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gpt.squirrelLogistics.gitImageUpload.GitHubUploader;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/reportImage")
public class ReportImageController {
    private final String uploadDir = new File("uploads").getAbsolutePath() + "/";
	private final GitHubUploader gitHubUploader;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 저장할 경로
			String rawUrl = gitHubUploader.uploadImage(file.getBytes(), file.getOriginalFilename());
            String filePath = uploadDir + file.getOriginalFilename();
            File dest = new File(filePath);
            dest.getParentFile().mkdirs(); // 폴더 없으면 생성
            file.transferTo(dest);

            // DB에는 file.getOriginalFilename()만 저장하면 됨
            return ResponseEntity.ok(rawUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
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
}
