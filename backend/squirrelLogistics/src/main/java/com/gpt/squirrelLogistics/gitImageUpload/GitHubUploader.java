package com.gpt.squirrelLogistics.gitImageUpload;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class GitHubUploader {

	@Value("${github.owner}")
	private String owner;
	@Value("${github.repo}")
	private String repo;
	@Value("${github.branch}")
	private String branch;
	@Value("${github.basePath}")
	private String basePath;
	@Value("${github.token}")
	private String token;

	private final WebClient client = WebClient.builder().baseUrl("https://api.github.com")
			.defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json").build();

	/** 이미지를 GitHub repo에 업로드하고 raw URL(download_url)을 반환 */
	public String uploadImage(byte[] bytes, String originalFilename) {
		String ext = ".bin";
		if (originalFilename != null) {
			int idx = originalFilename.lastIndexOf('.');
			if (idx >= 0)
				ext = originalFilename.substring(idx);
		}

		// 1) 파일명: UUID + 원 확장자 (덮어쓰기 위험 방지)
		String stored = UUID.randomUUID() + ext;

		// 2) 경로 조립: 날짜폴더를 쓰지 않으면 basePath/stored 만
		// (절대 인코딩 금지, pathSegment 로 분리)
		var uriBuilder = client.put().uri(b -> {
			b.pathSegment("repos", owner, repo, "contents", basePath);
			b.pathSegment(stored);
			return b.build();
		});

		Map<String, Object> payload = Map.of("message",
				"Upload banner image: " + (originalFilename != null ? originalFilename : stored), "content",
				Base64.getEncoder().encodeToString(bytes), "branch", branch);

		@SuppressWarnings("unchecked")
		Map<String, Object> resp = uriBuilder.headers(h -> h.setBearerAuth(token)).bodyValue(payload).retrieve()
				.bodyToMono(Map.class).block();

		@SuppressWarnings("unchecked")
		Map<String, Object> content = (Map<String, Object>) resp.get("content");
		return (String) content.get("download_url"); // ← 이 값을 DB에 저장
	}
}