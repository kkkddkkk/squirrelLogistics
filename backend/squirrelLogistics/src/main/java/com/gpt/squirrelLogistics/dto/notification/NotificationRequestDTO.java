package com.gpt.squirrelLogistics.dto.notification;
import com.gpt.squirrelLogistics.enums.notification.NotificationTypeEnum;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequestDTO {
	private Long adminId; //관리자 아이디.
	private String title; //제목.
	private String content; //내용.
	private NotificationTypeEnum type; //종류.
}
