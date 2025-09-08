package com.gpt.squirrelLogistics.controller.deliveryCompleted;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryCompleted.DeliveryCompletedCardDTO;
import com.gpt.squirrelLogistics.service.deliveryCompleted.DeliveryCompletedService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery/completed")
@RequiredArgsConstructor
@Log4j2
public class DeliveryCompletedController {

	private final DeliveryCompletedService deliveryCompletedService;
	private final JwtTokenProvider jwtTokenProvider;
	private final DriverTokenValidService tokenValidService;

	// JWT 토큰에서 userId 추출하는 공통 메서드
	private Long extractUserIdFromToken(String authHeader) {
		log.info("extractUserIdFromToken 호출됨, authHeader: {}", authHeader);

		try {
			// test-token 처리
			if (authHeader != null && authHeader.contains("test-token")) {
				log.info("test-token 감지됨, userId = 9 반환");
				return 9L; // test-token일 경우 userId = 9 반환
			}

			String token = authHeader.replace("Bearer ", "");
			Jws<Claims> claims = jwtTokenProvider.parse(token);
			Object uidObj = claims.getBody().get("uid");

			log.info("JWT에서 추출된 uid 원본: {} (타입: {})", uidObj,
					uidObj != null ? uidObj.getClass().getSimpleName() : "null");

			if (uidObj instanceof Integer) {
				return ((Integer) uidObj).longValue();
			} else if (uidObj instanceof Long) {
				return (Long) uidObj;
			} else if (uidObj instanceof Double) {
				return ((Double) uidObj).longValue();
			} else {
				log.error("예상치 못한 uid 타입: {}", uidObj != null ? uidObj.getClass().getSimpleName() : "null");
				throw new RuntimeException("Invalid uid type in JWT token");
			}
		} catch (Exception e) {
			log.error("JWT 토큰 파싱 실패: {}", e.getMessage());
			throw new RuntimeException("Failed to parse JWT token", e);
		}
	}

	/**
	 * 작성자: 임수현 기능: 완료된 운송 목록 조회 (기존 DTO들을 조합하여 반환)
	 */
	@GetMapping("/list")
	public ResponseEntity<?> getCompletedDeliveries(
			@RequestHeader("Authorization") String authHeader) {
		try {
			log.info("=== getCompletedDeliveries 호출됨 ===");
			log.info("요청된 authHeader: {}", authHeader);

			Long userId = extractUserIdFromToken(authHeader);
			log.info("JWT에서 추출된 userId: {}", userId);

			// userId로 driverId 조회 (임시로 하드코딩된 driverId = 9 사용)
			//Long driverId = 9L; // TODO: userId로 driverId 조회하는 로직 추가

			//작성자: 고은설.
			//기능: 상수로 박힌 운전자 아이디 실데이터 추출 구조로 수정.
			AuthOutcome outcome = tokenValidService.resolve(authHeader);
			if (outcome instanceof AuthOutcome.Failure f)
				return toError(f);

			Long driverId = ((AuthOutcome.Success) outcome).driverId();
//			log.info("사용할 driverId: {}", driverId);
//
//			List<Map<String, Object>> result = deliveryCompletedService
//					.getCompletedDeliveriesWithActualDelivery(driverId);
//			log.info("조회된 운송 건 수: {}", result.size());
			
			List<DeliveryCompletedCardDTO> result = deliveryCompletedService.getCompletedListSlim(driverId);

			return ResponseEntity.ok(result);
		} catch (Exception e) {
			log.error("getCompletedDeliveries 오류 발생: {}", e.getMessage(), e);
			throw e;
		}
	}

	/**
	 * 작성자: 임수현 기능: 운송 상세 정보 조회 (기존 DTO들을 조합하여 반환)
	 */
	@GetMapping("/{assignedId}/detail")
	public ResponseEntity<?> getDeliveryDetail(@PathVariable("assignedId") Long assignedId,
			@RequestHeader("Authorization") String authHeader) {
		try {
			log.info("=== getDeliveryDetail 호출됨 ===");
			log.info("요청된 assignedId: {}", assignedId);
			log.info("요청된 authHeader: {}", authHeader);

			Long userId = extractUserIdFromToken(authHeader);
			log.info("JWT에서 추출된 userId: {}", userId);

			// userId로 driverId 조회 (임시로 하드코딩된 driverId = 9 사용)
			//Long driverId = 9L; // TODO: userId로 driverId 조회하는 로직 

			//작성자: 고은설.
			//기능: 상수로 박힌 운전자 아이디 실데이터 추출 구조로 수정.
			AuthOutcome outcome = tokenValidService.resolve(authHeader);
			if (outcome instanceof AuthOutcome.Failure f)
				return toError(f);

			Long driverId = ((AuthOutcome.Success) outcome).driverId();
			
			log.info("사용할 driverId: {}", driverId);

			// 상세 정보 조회
			log.info("getDeliveryDetail 호출 시작");
			Map<String, Object> result = deliveryCompletedService.getDeliveryDetail(assignedId, driverId);

			log.info("조회된 운송 상세 정보: assignedId={}", assignedId);

			return ResponseEntity.ok(result);
		} catch (Exception e) {
			log.error("getDeliveryDetail 오류 발생: {}", e.getMessage(), e);
			log.error("오류 스택 트레이스:", e);
			throw e;
		}
	}

	// ================================================[프론트 알림용 예외처리] 작성자: 고은설.
	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}

}