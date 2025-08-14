package com.gpt.squirrelLogistics.service.review;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.enums.review.StateEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class ReviewService {

	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final ReviewRepository reviewRepository;

	public Long regiReview(ReviewRequestDTO reviewRequestDTO) {
		log.info("리뷰 등록 중");

		LocalDateTime now = LocalDateTime.now();

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findById(reviewRequestDTO.getAssignedId())
				.orElseThrow(() -> new RuntimeException("DeliveryAssignment not found"));

		Review review = Review.builder()
				.rating(reviewRequestDTO.getRating())
				.reason(reviewRequestDTO.getReason())
				.stateEnum(StateEnum.SUBMITTED)
				.deliveryAssignment(deliveryAssignment)
				.regDate(now)
				.build();

		return reviewRepository.save(review).getReviewId();
	}

	public void modify(ReviewRequestDTO reviewRequestDTO) {
		Optional<Review> result = reviewRepository.findById(reviewRequestDTO.getReviewId());
		Review review = result.orElseThrow();
		
		review.setRating(reviewRequestDTO.getRating());
		review.setReason(reviewRequestDTO.getReason());
		review.setStateEnum(StateEnum.EDITED);
		review.setModiDate(LocalDateTime.now());
	}
	
	public void delete(Long reviewId) {
		reviewRepository.deleteById(reviewId);
	}
}
