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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.review.ReviewService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    
	private final FindUserByTokenService findUserByTokenService;
	private final CompanyRepository companyRepository;
    
    @GetMapping
	@TimedEndpoint("readReview")
	public Map<String, Object> readReview(@RequestParam("assignedId") Long assignedId){
		return reviewService.readReview(assignedId);
	}
    
    @GetMapping("/list")
    @TimedEndpoint("reviewList")
	public List<Map<String, Object>> reviewList(@RequestHeader("Authorization")String token){
		Long userId = findUserByTokenService.getUserIdByToken(token);
		Long companyId = companyRepository.findCompanyIdByUserId(userId);
    	
		return reviewService.reviewList(companyId);
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

}
