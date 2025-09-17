package com.gpt.squirrelLogistics.dto.banner;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerListDTO {
	private Long bannerId; //배너 아이디.
	private Long adminId;//관리자Id
	private Long noticeId;//공지Id
	private String title; //제목.
	private String subTitle;//부제목
	private String imageUrl; //이미지 경로.
}
