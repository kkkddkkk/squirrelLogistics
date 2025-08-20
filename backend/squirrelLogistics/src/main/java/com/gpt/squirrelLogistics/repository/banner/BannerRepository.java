package com.gpt.squirrelLogistics.repository.banner;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.banner.Banner;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    // 기본 CRUD는 JpaRepository에서 제공

    // 활성/비활성 배너 수
    long countByIsActiveTrue();
    long countByIsActiveFalse();
    
    // 키워드 및 필터로 검색 (간단한 방식)
    @Query("SELECT b FROM Banner b WHERE " +
           "(:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR b.isActive = CASE WHEN :status = 'ACTIVE' THEN true ELSE false END)")
    Page<Banner> findByKeywordAndFilters(@Param("keyword") String keyword, 
                                        @Param("status") String status, 
                                        @Param("position") String position, 
                                        Pageable pageable);
    
    // 필터로 검색 (키워드 없음, 간단한 방식)
    @Query("SELECT b FROM Banner b WHERE " +
           "(:status IS NULL OR b.isActive = CASE WHEN :status = 'ACTIVE' THEN true ELSE false END)")
    Page<Banner> findByFilters(@Param("status") String status, 
                               @Param("position") String position, 
                               Pageable pageable);
    
    // 활성 배너만 조회 (생성일 순으로)
    List<Banner> findByIsActiveTrueOrderByRegDateAsc();
}
