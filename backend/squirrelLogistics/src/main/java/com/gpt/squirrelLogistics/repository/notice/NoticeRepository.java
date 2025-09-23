package com.gpt.squirrelLogistics.repository.notice;

import com.gpt.squirrelLogistics.entity.notice.Notice;

import java.time.LocalDateTime;
import java.util.Optional;

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
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
	void incrementViewCount(@Param("id") Long id);

	// 작성자: 고은설.
	// 기능: 핀만 빠르게 수정하기.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Notice n set n.pinned = :pinned where n.id = :id")
	int updatePinned(@Param("id") Long id, @Param("pinned") boolean pinned);

	// 작성자: 고은설.
	// 기능: 공지 id에 해당하는 배너 이미지 url가져오기.
	@Query("select b.imageUrl from Banner b where b.notice.id = :noticeId")
	Optional<String> findActiveImageUrlByNoticeId(@Param("noticeId") Long noticeId);
}
