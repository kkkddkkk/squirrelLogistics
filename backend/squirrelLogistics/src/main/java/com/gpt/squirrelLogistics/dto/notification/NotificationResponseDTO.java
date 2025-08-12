package com.gpt.squirrelLogistics.dto.notification;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.enums.notification.NotificationTypeEnum;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
	private Long notiId; //공지 아이디.
    private AdminUserResponseDTO adminUserDTO; //관리자 정보 객체.

    private String title; //제목.
    private String content; //내용.
	private NotificationTypeEnum type; //종류.

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate; //생성일.
}
