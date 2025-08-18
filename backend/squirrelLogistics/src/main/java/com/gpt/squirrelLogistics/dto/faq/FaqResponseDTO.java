package com.gpt.squirrelLogistics.dto.faq;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqResponseDTO {
    private Long faqId;                               // 엔티티 id
    private AdminUserResponseDTO adminUserDTO;        // 선택: 관리자 정보 객체

    private String question;
    private String answer;
    private FaqCategoryEnum category;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime regDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime modiDate;
}
