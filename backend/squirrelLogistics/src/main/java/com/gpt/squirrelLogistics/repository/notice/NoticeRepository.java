package com.gpt.squirrelLogistics.repository.notice;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.notice.Notice;


public interface NoticeRepository extends JpaRepository<Notice, Long> {

}
