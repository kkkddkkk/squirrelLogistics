package com.gpt.squirrelLogistics.service.review;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.report.Report;
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
	
	public List<Map<String, Object>> reviewList(Long companyId) {
		List<Review> reviews = reviewRepository.findByCompanyId(companyId);
		
		List<Map<String, Object>> result = reviews.stream().map(review -> {
			Map<String, Object> map = new HashMap<>();
			List <Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(review.getDeliveryAssignment().getAssignedId());
			List<Object[]> driverList = deliveryAssignmentRepository.findDriverById(review.getDeliveryAssignment().getAssignedId());
			
			map.put("assignedId", review.getDeliveryAssignment().getAssignedId());
			map.put("reviewId", review.getReviewId());
			map.put("rating", review.getRating());
			map.put("reason", review.getReason());
			map.put("regDate", review.getRegDate());
			map.put("startAddress", addressList.get(0)[0]);
			map.put("endAddress", addressList.get(0)[1]);
			map.put("driverName", driverList.get(0)[0]);
			
			return map;
		}).toList();
		
		return result;
	}
	
	//리뷰 보기
	public Map<String, Object> readReview(Long assignedId) {
		List<Object[]> reviewList = deliveryAssignmentRepository.findReviewById(assignedId);
		Object[] reviewListArr;
		Object[] driverList = deliveryAssignmentRepository.findDriverById(assignedId).get(0);
		
		if (reviewList != null && !reviewList.isEmpty()) {
		    reviewListArr = reviewList.get(0);
		} else {
			reviewListArr = new Object[]{0, 0, ""};
		}
		
		Object[] reviewContent = new Object[reviewListArr.length + driverList.length];
		int pos = 0;
		for (Object o : reviewListArr) reviewContent[pos++] = o;
		for (Object o : driverList) reviewContent[pos++] = o;
		
		String[] keys= {"reviewId", "rating", "reason", "driverName", "carName"};
		
	    Map<String, Object> map = new LinkedHashMap<>();
		for(int i=0;i<reviewContent.length;i++) {
			if(reviewContent[i]!=null) {
				map.put(keys[i], reviewContent[i]);
			}else {
				map.put(keys[i], null);
			}
		}
			
		return map;
	}
	

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

    @Transactional
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
	
	//작성자: 고은설
	//기능: 아이디에 해당하는 드라이버가 진행한 운송건에 대한 리뷰 조회 + 페이지네이션 추가 (삭제 금지).
	public Page<DriverReviewCardResponseDTO> getSubmittedReviews(Long driverId, Pageable pageable) {
	    return reviewRepository.findAllSubmittedByDriverId(driverId, pageable);
	}
}
