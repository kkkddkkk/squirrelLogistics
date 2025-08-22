package com.gpt.squirrelLogistics.repository.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.review.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	Optional<Review> findAllByDeliveryAssignment_AssignedId(long assignedId);
	
//	@Query("SELECT r.rating, r.rReason, r.regDate FROM Review r "
//			+ "WHERE r.reviewId = : reviewId")
//	List<Object[]> findReviewContent(@Param("reviewId") Long reviewId);
	
	// 기사 검색을 위한 메서드 추가
	// 드라이버 ID로 리뷰 조회 (DeliveryAssignment를 통해)
	@Query("SELECT r FROM Review r " +
		   "JOIN r.deliveryAssignment da " +
		   "JOIN da.driver d " +
		   "WHERE d.driverId = :driverId")
	List<Review> findByDriverId(@Param("driverId") Long driverId);
}
