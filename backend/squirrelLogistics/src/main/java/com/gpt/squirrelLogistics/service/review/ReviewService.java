package com.gpt.squirrelLogistics.service.review;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
	
	public List<Map<String, Object>> reviewList() {
		List<Review> reviews = reviewRepository.findAll();
		
		List<Map<String, Object>> result = reviews.stream().map(review -> {
			Map<String, Object> map = new HashMap<>();
			
			try {
				// 기본 리뷰 정보
				map.put("assignedId", review.getDeliveryAssignment().getAssignedId());
				map.put("reviewId", review.getReviewId());
				map.put("rating", review.getRating());
				map.put("reason", review.getReason());
				map.put("content", review.getReason()); // 프론트엔드 호환성
				map.put("regDate", review.getRegDate());
				
				// 상태 정보 (프론트엔드 호환성을 위해 매핑)
				String reviewStatus = review.getStateEnum() != null ? review.getStateEnum().name() : "PENDING";
				String mappedStatus = mapReviewStatus(reviewStatus);
				
				map.put("stateEnum", mappedStatus);
				map.put("status", mappedStatus);
				
				// 운송 상태 정보
				if (review.getDeliveryAssignment() != null) {
					DeliveryAssignment da = review.getDeliveryAssignment();
					String deliveryStatus = da.getStatus() != null ? da.getStatus().name() : "UNKNOWN";
					map.put("deliveryStatus", deliveryStatus);
				}
				
				// 주소 정보 조회
				try {
					List<Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(review.getDeliveryAssignment().getAssignedId());
					if (addressList != null && !addressList.isEmpty()) {
						map.put("startAddress", addressList.get(0)[0]);
						map.put("endAddress", addressList.get(0)[1]);
					} else {
						map.put("startAddress", "주소 정보 없음");
						map.put("endAddress", "주소 정보 없음");
					}
				} catch (Exception e) {
					log.warn("주소 정보 조회 실패: {}", e.getMessage());
					map.put("startAddress", "주소 정보 없음");
					map.put("endAddress", "주소 정보 없음");
				}
				
				// 기사 정보 조회
				try {
					List<Object[]> driverList = deliveryAssignmentRepository.findDriverById(review.getDeliveryAssignment().getAssignedId().toString());
					if (driverList != null && !driverList.isEmpty()) {
						map.put("driverName", driverList.get(0)[0]);
					} else {
						map.put("driverName", "기사 정보 없음");
					}
				} catch (Exception e) {
					log.warn("기사 정보 조회 실패: {}", e.getMessage());
					map.put("driverName", "기사 정보 없음");
				}
				
			} catch (Exception e) {
				log.error("리뷰 데이터 처리 중 오류 발생: {}", e.getMessage(), e);
				// 기본값 설정
				map.put("assignedId", 0);
				map.put("reviewId", review.getReviewId());
				map.put("rating", review.getRating());
				map.put("reason", review.getReason() != null ? review.getReason() : "내용 없음");
				map.put("content", review.getReason() != null ? review.getReason() : "내용 없음");
				map.put("regDate", review.getRegDate());
				map.put("stateEnum", "ERROR");
				map.put("status", "ERROR");
				map.put("startAddress", "주소 정보 없음");
				map.put("endAddress", "주소 정보 없음");
				map.put("driverName", "기사 정보 없음");
			}
			
			return map;
		}).toList();
		
		return result;
	}
	
	//리뷰 보기 (기존 메서드 개선)
	public Map<String, Object> readReview(String assignedId) {
		log.info("리뷰 보기 시작 (assignedId): {}", assignedId);
		
		try {
			Map<String, Object> map = new LinkedHashMap<>();
			
			// 리뷰 정보 조회
			List<Object[]> reviewList = deliveryAssignmentRepository.findReviewById(assignedId);
			if (reviewList != null && !reviewList.isEmpty()) {
				Object[] reviewData = reviewList.get(0);
				map.put("reviewId", reviewData[0]);
				map.put("rating", reviewData[1]);
				map.put("reason", reviewData[2]);
				map.put("content", reviewData[2]); // 프론트엔드 호환성
			} else {
				map.put("reviewId", 0);
				map.put("rating", 0);
				map.put("reason", "리뷰 없음");
				map.put("content", "리뷰 없음");
			}
			
			// 기사 정보 조회
			try {
				List<Object[]> driverList = deliveryAssignmentRepository.findDriverById(assignedId);
				if (driverList != null && !driverList.isEmpty()) {
					map.put("driverName", driverList.get(0)[0]);
					map.put("carName", driverList.get(0)[1]);
				} else {
					map.put("driverName", "기사 정보 없음");
					map.put("carName", "차량 정보 없음");
				}
			} catch (Exception e) {
				log.warn("기사 정보 조회 실패: {}", e.getMessage());
				map.put("driverName", "기사 정보 없음");
				map.put("carName", "차량 정보 없음");
			}
			
			// 상태 정보 추가 (기본값)
			map.put("stateEnum", "PENDING");
			map.put("status", "PENDING");
			
			log.info("리뷰 보기 완료: {}", map);
			return map;
			
		} catch (Exception e) {
			log.error("리뷰 보기 중 오류 발생: {}", e.getMessage(), e);
			return Map.of(
				"reviewId", 0,
				"rating", 0,
				"reason", "오류 발생",
				"content", "오류 발생",
				"driverName", "기사 정보 없음",
				"carName", "차량 정보 없음",
				"stateEnum", "ERROR",
				"status", "ERROR"
			);
		}
	}
	
	// 리뷰 상세 조회 (새로운 메서드)
	public Map<String, Object> readReviewDetail(String reviewId) {
		log.info("리뷰 상세 조회 시작 (ID): {}", reviewId);
		
		try {
			Optional<Review> reviewOpt = reviewRepository.findById(Long.parseLong(reviewId));
			if (reviewOpt.isEmpty()) {
				log.warn("리뷰를 찾을 수 없습니다. ID: {}", reviewId);
				return Map.of("error", "리뷰를 찾을 수 없습니다.");
			}
			
			Review review = reviewOpt.get();
			Map<String, Object> result = new HashMap<>();
			
			// 기본 리뷰 정보
			result.put("reviewId", review.getReviewId());
			result.put("rating", review.getRating());
			result.put("reason", review.getReason());
			result.put("content", review.getReason()); // 프론트엔드 호환성
			result.put("regDate", review.getRegDate());
			result.put("modiDate", review.getModiDate());
			
			// 상태 정보 (프론트엔드 호환성을 위해 매핑)
			String reviewStatus = review.getStateEnum() != null ? review.getStateEnum().name() : "PENDING";
			String mappedStatus = mapReviewStatus(reviewStatus);
			result.put("stateEnum", mappedStatus);
			result.put("status", mappedStatus);
			
			// 운송 정보
			if (review.getDeliveryAssignment() != null) {
				DeliveryAssignment da = review.getDeliveryAssignment();
				result.put("assignedId", da.getAssignedId());
				
				// 운송 상태 정보
				if (da.getStatus() != null) {
					result.put("deliveryStatus", da.getStatus().name());
				}
				
				// 기사 정보 조회
				try {
					List<Object[]> driverList = deliveryAssignmentRepository.findDriverById(da.getAssignedId().toString());
					if (driverList != null && !driverList.isEmpty()) {
						result.put("driverName", driverList.get(0)[0]);
					}
				} catch (Exception e) {
					log.warn("기사 정보 조회 실패: {}", e.getMessage());
					result.put("driverName", "기사 정보 없음");
				}
				
				// 주소 정보 조회
				try {
					List<Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(da.getAssignedId());
					if (addressList != null && !addressList.isEmpty()) {
						result.put("startAddress", addressList.get(0)[0]);
						result.put("endAddress", addressList.get(0)[1]);
					}
				} catch (Exception e) {
					log.warn("주소 정보 조회 실패: {}", e.getMessage());
					result.put("startAddress", "주소 정보 없음");
					result.put("endAddress", "주소 정보 없음");
				}
			}
			
			log.info("리뷰 상세 조회 완료: {}", result);
			return result;
			
		} catch (Exception e) {
			log.error("리뷰 상세 조회 중 오류 발생: {}", e.getMessage(), e);
			return Map.of("error", "리뷰 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
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
	
	// 리뷰 승인
	@Transactional
	public void approveReview(Long reviewId) {
		log.info("리뷰 승인 시작 (ID): {}", reviewId);
		
		Review review = reviewRepository.findById(reviewId)
			.orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다. ID: " + reviewId));
		
		review.setStateEnum(StateEnum.SUBMITTED); // SUBMITTED는 승인됨으로 매핑됨
		review.setModiDate(LocalDateTime.now());
		
		log.info("리뷰 승인 완료 (ID): {}", reviewId);
	}
	
	// 리뷰 숨김 처리
	@Transactional
	public void hideReview(Long reviewId) {
		log.info("리뷰 숨김 처리 시작 (ID): {}", reviewId);
		
		Review review = reviewRepository.findById(reviewId)
			.orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다. ID: " + reviewId));
		
		review.setStateEnum(StateEnum.DELETED); // DELETED는 숨김으로 매핑됨
		review.setModiDate(LocalDateTime.now());
		
		log.info("리뷰 숨김 처리 완료 (ID): {}", reviewId);
	}
	
	// 리뷰 반려
	@Transactional
	public void rejectReview(Long reviewId, String reason) {
		log.info("리뷰 반려 시작 (ID): {}, 사유: {}", reviewId, reason);
		
		Review review = reviewRepository.findById(reviewId)
			.orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다. ID: " + reviewId));
		
		// 반려 상태를 위한 새로운 Enum 값이 필요하지만, 현재는 EDITED로 설정
		review.setStateEnum(StateEnum.EDITED);
		review.setModiDate(LocalDateTime.now());
		
		log.info("리뷰 반려 완료 (ID): {}", reviewId);
	}

	// 리뷰 상태값을 프론트엔드에서 기대하는 값으로 매핑
	private String mapReviewStatus(String reviewStatus) {
		if (reviewStatus == null) return "PENDING";
		
		switch (reviewStatus.toUpperCase()) {
			case "PENDING":
				return "PENDING";      // 대기중
			case "SUBMITTED":
				return "APPROVED";     // 승인됨 (등록 완료)
			case "EDITED":
				return "EDITED";       // 수정됨
			case "DELETED":
			case "ADMIN_DELETED":
				return "HIDDEN";       // 숨김 (삭제됨)
			case "APPROVED":
				return "APPROVED";     // 승인됨 (직접 설정)
			case "REJECTED":
				return "REJECTED";     // 반려됨
			case "REPORTED":
				return "REPORTED";     // 신고됨
			case "ERROR":
				return "ERROR";        // 오류
			default:
				log.warn("알 수 없는 리뷰 상태: {}, 기본값 PENDING 사용", reviewStatus);
				return "PENDING";      // 기본값
		}
	}
}
