package com.gpt.squirrelLogistics.dto.notice;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeResponseDTO {
    private Long id;                 // ✅ 프론트에서 notice.id 사용
    private String title;
    private String content;
    private boolean pinned;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt; // ✅ 프론트에서 notice.createdAt 사용

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime updatedAt;
}
