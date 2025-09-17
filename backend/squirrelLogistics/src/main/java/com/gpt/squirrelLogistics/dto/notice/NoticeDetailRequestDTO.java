package com.gpt.squirrelLogistics.dto.notice;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeDetailRequestDTO {
    private String title;
    private String content;
    private Integer viewCount;
    private boolean pinned;
    private String writer;
    
    //작성자: 고은설.
    //기능: 사진 게시를 위해 무엇이 필요한지 몰라 일단 문자열 확보.
    private String bannerFileName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}
