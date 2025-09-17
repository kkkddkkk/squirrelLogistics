package com.gpt.squirrelLogistics.repository.notice;

import com.gpt.squirrelLogistics.entity.notice.Notice;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

	// 작성자: 고은설.
	// 기능: 키워드 검색 후 결과 반환.
	@Query("""
			    SELECT n
			    FROM Notice n
			    WHERE (:kw IS NULL OR :kw = '' OR
			           lower(n.title)   LIKE lower(concat('%', :kw, '%')) OR
			           lower(n.content) LIKE lower(concat('%', :kw, '%')))
			""")
	Page<Notice> search(@Param("kw") String keyword, Pageable pageable);

	// 작성자: 고은설.
	// 기능: 공지사항 1회 조회될때마다 조회수 증가.
	@Modifying
	@Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
	void incrementViewCount(@Param("id") Long id);
}
