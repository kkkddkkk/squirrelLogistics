package com.gpt.squirrelLogistics.controller.review;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/review")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    
    @GetMapping
	@TimedEndpoint("readReview")
	public Map<String, Object> readReview(@RequestParam("assignedId") String assignedId){
		return reviewService.readReview(assignedId);
	}
    
    // 리뷰 상세 조회 (새로운 메서드)
    @GetMapping("/detail")
	@TimedEndpoint("readReviewDetail")
	public Map<String, Object> readReviewDetail(@RequestParam("reviewId") String reviewId){
		return reviewService.readReviewDetail(reviewId);
	}
    
    @GetMapping("/list")
    @TimedEndpoint("reviewList")
	public List<Map<String, Object>> reviewList(){
		
		return reviewService.reviewList();
	}
    
    @PostMapping
    public Map<String, Long> createReview(@RequestBody ReviewRequestDTO reviewDTO ) {
    	Long reviewId = reviewService.regiReview(reviewDTO);

        return Map.of("reviewId", reviewId);
    }
    
    @PutMapping("/{reviewId}")
    public Map<String, Long> modiReview(@PathVariable(name="reviewId") Long reviewId, @RequestBody ReviewRequestDTO reviewDTO ) {
    	reviewDTO.setReviewId(reviewId);
    	reviewService.modify(reviewDTO);

        return Map.of("reviewId", reviewId);
    }
    
    @DeleteMapping("/{reviewId}")
    public Map<String, Long> delReview(@PathVariable(name="reviewId") Long reviewId){
    	reviewService.delete(reviewId);
    	return Map.of("reviewId", reviewId);
    }
    
    // 리뷰 승인
    @PutMapping("/{reviewId}/approve")
    public Map<String, String> approveReview(@PathVariable(name="reviewId") Long reviewId) {
    	reviewService.approveReview(reviewId);
    	return Map.of("message", "리뷰가 승인되었습니다.");
    }
    
    // 리뷰 숨김 처리
    @PutMapping("/{reviewId}/hide")
    public Map<String, String> hideReview(@PathVariable(name="reviewId") Long reviewId) {
    	reviewService.hideReview(reviewId);
    	return Map.of("message", "리뷰가 숨김 처리되었습니다.");
    }
    
    // 리뷰 반려
    @PutMapping("/{reviewId}/reject")
    public Map<String, String> rejectReview(@PathVariable(name="reviewId") Long reviewId, @RequestBody Map<String, String> request) {
    	String reason = request.getOrDefault("reason", "사유 없음");
    	reviewService.rejectReview(reviewId, reason);
    	return Map.of("message", "리뷰가 반려되었습니다.");
    }
}
