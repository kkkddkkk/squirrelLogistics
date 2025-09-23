package com.gpt.squirrelLogistics.service.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeDetailRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeSlimCardDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;

public interface NoticeService {

	//작성자: 고은설.
	//기능: 새 공지 작성.
	Long create(NoticeRequestDTO dto);

	//작성자: 고은설.
	//기능: 검색어 포함 페이지 요청정보 기반의 목록 반환.
	RequestPageResponseDTO<NoticeSlimCardDTO> list(RequestPageRequestDTO req);

	//작성자: 고은설.
	//기능: 이미 작성한 공지사항 업데이트.
	void update(Long id, NoticeRequestDTO dto);

	//작성자: 고은설.
	//기능: 공지 사항 단건 조회.
	NoticeDetailRequestDTO getOne(Long id, boolean increaseView);

	//작성자: 고은설.
	//기능: 공지 사항 삭제.
	void delete(Long id);
	
	//경량 고정 업데이트.
	public void setPinned(Long id, boolean pinned);
}
