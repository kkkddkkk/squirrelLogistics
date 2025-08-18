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
}
