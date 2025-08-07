package com.gpt.squirrelLogistics.dto.banner;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponseDTO {
	private Long bannerId; //배너 아이디.
	private AdminUserResponseDTO adminUserDTO; //관리자 정보 객체.
	private String title; //제목.
	private String imageUrl; //이미지 경로.
	private boolean isActive; //노출 여부.
	
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //생성일.
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.

}
