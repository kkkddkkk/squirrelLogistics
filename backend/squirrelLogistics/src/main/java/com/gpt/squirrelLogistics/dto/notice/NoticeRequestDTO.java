package com.gpt.squirrelLogistics.dto.notice;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeRequestDTO {
    private String title;

    private String content;

    private Boolean pinned;
    
    private Long adminId;
}
