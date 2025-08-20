package com.gpt.squirrelLogistics.repository.notice;

import com.gpt.squirrelLogistics.entity.notice.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 기본 JPA 기능 사용
    // 정렬과 검색은 Service 레이어에서 처리
}
