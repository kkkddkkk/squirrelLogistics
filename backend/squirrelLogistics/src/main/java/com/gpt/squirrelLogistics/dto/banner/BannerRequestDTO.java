package com.gpt.squirrelLogistics.dto.banner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerRequestDTO {
	private Long adminId; //관리자 아이디.
	private Long noticeId;//공지Id
    private String title; //제목.
    private String subTitle;//부제목
    private String imageUrl; //이미지 경로.
    private boolean isActive; //노출 여부.
}
