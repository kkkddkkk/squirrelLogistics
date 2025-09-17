package com.gpt.squirrelLogistics.controller.deliveryRequest;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.gpt.squirrelLogistics.dto.deliveryRequest.CreatedRequestPaymentInfoDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryOrchestrator.DeliveryOrchestrator;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthErrorCode;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverAuthException;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;
import jakarta.validation.constraints.NotNull;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DriverAssignmentResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/requests")
@RequiredArgsConstructor
@Log4j2
public class DeliveryRequestController {

	private final DeliveryRequestService requestService;
	private final DeliveryAssignmentService assignmentService;
	private final DeliveryOrchestrator deliveryOrchestrator;
	private final FindUserByTokenService findUserByTokenService;
	private final UserRepository userRepository;

	private final DriverTokenValidService tokenValidService;

	public record CreatRequest(@jakarta.validation.Valid PaymentDTO payment,
			@jakarta.validation.Valid DeliveryRequestRequestDTO request) {
	}

	public record ProposeRequest(@Valid PaymentDTO payment, @Valid DeliveryRequestRequestDTO request,
			@NotNull Long driverId) {
	}

	// 생성
	@PostMapping
	public CreatedRequestPaymentInfoDTO create(@Valid @RequestBody CreatRequest payload) {

		return requestService.create(payload.payment(), payload.request());
	}

	// 단건 조회 (상세 응답 사용 권장)
	@GetMapping("/{id}")
	@TimedEndpoint("request_detail")
	public ResponseEntity<?> read(@PathVariable("id") Long id,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).Id();

		DeliveryRequestResponseDTO dto = requestService.readFullSafe(id, driverId);

		if (dto == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.REQUEST_NOT_FOUND.toString());
		}

		return ResponseEntity.ok(dto);
	}

	/** 단건 슬림 조회 (Slim DTO) - 필요 시 사용 */
	@GetMapping("/{id}/slim")
	public ResponseEntity<DeliveryRequestSlimResponseDTO> readSlim(@PathVariable("id") Long id) {
		return ResponseEntity.ok(requestService.readSlim(id));
	}

	// 수정 (PUT 전체/ PATCH 부분)
	@PutMapping("/{id}")
	public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody DeliveryRequestRequestDTO dto) {
		requestService.update(id, dto);
		return ResponseEntity.noContent().build();
	}

	// 삭제
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		requestService.delete(id);
		return ResponseEntity.noContent().build();
	}

	// 목록 (슬림 응답 + 커스텀 페이지 DTO)
//	@GetMapping
//	@TimedEndpoint("request_list")
//	public ResponseEntity<PageResponseDTO<DeliveryRequestCardSlimDTO>> list(@ModelAttribute PageRequestDTO pageReq) {
//		PageResponseDTO<DeliveryRequestCardSlimDTO> page = requestService.list(pageReq);
//		return ResponseEntity.ok(page);
//	}

	@GetMapping
	@TimedEndpoint("request_list")
	public ResponseEntity<?> list(@ModelAttribute RequestPageRequestDTO pageReq,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		RequestPageResponseDTO<DeliveryRequestCardSlimDTO> page = requestService.listWithFilter(pageReq);
		return ResponseEntity.ok(page);
	}

	/** 목록 - Spring 표준 Pageable(Page<T>) */
	@GetMapping("/page")
	public Page<DeliveryRequestSlimResponseDTO> getPage(Pageable pageable) {
		return requestService.getPage(pageable);
	}

	// 요청 승낙
	@PutMapping("/{id}/accept")
	public ResponseEntity<?> accept(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("id") Long requestId) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).Id();
		Map<String, String> result = assignmentService.accept(requestId, driverId);

		if (result.containsKey("FAILED")) {
			switch (result.get("FAILED")) {
			case "REQUEST_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.REQUEST_NOT_FOUND.toString());
			case "DRIVER_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.DRIVER_NOT_FOUND.toString());
			case "REQUEST_ALREADY_TAKEN":
				return ResponseEntity.status(HttpStatus.GONE).body(AuthErrorCode.REQUEST_ALREADY_TAKEN.toString());
			case "VEHICLE_TYPE_MISMATCH":
				return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
						.body(AuthErrorCode.VEHICLE_TYPE_MISMATCH.toString());
			case "SCHEDULE_CONFLICT":
				return ResponseEntity.status(HttpStatus.CONFLICT).body(AuthErrorCode.SCHEDULE_CONFLICT.toString());
			case "ALREADY_ACCEPTED":
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body(AuthErrorCode.ALREADY_ACCEPTED.toString());
			default:
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthErrorCode.UNKNOWN.toString());
			}
		}

		// 성공 케이스
		return ResponseEntity.ok(result);
	}

	// 요청 생성과 동시에 지명 제안, 물류회사 전용.
	@PostMapping("/propose")
	public ResponseEntity<?> createAndPropose(@Valid @RequestBody ProposeRequest payload,
			@RequestHeader("Authorization") String token) {

		Long userId = findUserByTokenService.getUserIdByToken(token);

		if (userId == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.TOKEN_INVALID.toString());
		}

		User user = userRepository.getReferenceById(userId);

		if (user == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.USER_NOT_FOUND.toString());
		}

		if (user.getRole() != UserRoleEnum.COMPANY) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.NOT_COMPANY.toString());
		}

		CreatedRequestPaymentInfoDTO result = deliveryOrchestrator.createAndPropose(payload.request(),
				payload.payment(), payload.driverId());

		if (result == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthErrorCode.UNKNOWN.toString());
		}

		return ResponseEntity.ok(result);
	}

	// 특정 요청에 지명된 기사 정보 조회 (작성자: 정윤진)
	@GetMapping("/{id}/driver-assignment")
	public ResponseEntity<DriverAssignmentResponseDTO> getDriverAssignment(@PathVariable("id") Long requestId) {
		DriverAssignmentResponseDTO result = requestService.getDriverAssignmentByRequestId(requestId);
		if (result == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(result);
	}

	// 모든 지명된 요청의 기사 정보 조회 (작성자: 정윤진)
	@GetMapping("/driver-assignments")
	public ResponseEntity<List<DriverAssignmentResponseDTO>> getAllDriverAssignments() {
		List<DriverAssignmentResponseDTO> results = requestService.getAllAssignedDriverRequests();
		return ResponseEntity.ok(results);
	}

//	// 기사 지명 제안 (작성자: 정윤진)
//	@PostMapping("/{id}/propose")
//	public ResponseEntity<Map<String, Object>> proposeToDriver(@PathVariable("id") Long requestId,
//			@RequestParam("driverId") Long driverId) {
//
//		Map<String, Object> result = assignmentService.propose(requestId, driverId);
//
//		if (result.containsKey("FAILED")) {
//			String error = (String) result.get("FAILED");
//			HttpStatus status = switch (error) {
//			case "REQUEST_NOT_FOUND", "DRIVER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
//			case "ALREADY_ASSIGNED", "ALREADY_PROPOSED_TO_DRIVER" -> HttpStatus.CONFLICT;
//			default -> HttpStatus.BAD_REQUEST;
//			};
//			return ResponseEntity.status(status).body(au);
//		}
//
//		return ResponseEntity.ok(result);
//	}

	/* ============== 기사 지명 요청 관련 엔드포인트들 ============== */

	/**
	 * 🚛 기사 지명 요청 생성
	 * 
	 * @param request 기사 지명 요청 정보
	 * @return 생성된 요청 ID
	 */
	@PostMapping("/driver-requests")
	public ResponseEntity<Map<String, Object>> createDriverRequest(@RequestBody DriverSpecificRequestRequest request) {
		try {
			log.info("기사 지명 요청 생성 시작: driverId={}", request.getDriverId());

			Long requestId = requestService.createDriverRequest(request.getPaymentDto(), request.getRequestDto(),
					request.getDriverId());

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("requestId", requestId);
			response.put("message", "기사 지명 요청이 성공적으로 생성되었습니다.");

			log.info("기사 지명 요청 생성 완료: requestId={}", requestId);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("기사 지명 요청 생성 실패", e);

			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", "기사 지명 요청 생성에 실패했습니다: " + e.getMessage());

			return ResponseEntity.badRequest().body(response);
		}
	}

	/**
	 * 📱 결제 완료 후 기사 지명 요청 전송
	 * 
	 * @param requestId 배송 요청 ID
	 * @param request   결제 정보
	 * @return 전송 결과
	 */
	@PostMapping("/driver-requests/{requestId}/send")
	public ResponseEntity<Map<String, Object>> sendDriverRequestAfterPayment(@PathVariable Long requestId,
			@RequestBody PaymentCompletionRequest request) {
		try {
			log.info("기사 지명 요청 전송 시작: requestId={}, paymentId={}", requestId, request.getPaymentId());

			requestService.sendDriverRequestAfterPayment(requestId, request.getPaymentId());

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "기사 지명 요청이 성공적으로 전송되었습니다.");

			log.info("기사 지명 요청 전송 완료: requestId={}", requestId);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("기사 지명 요청 전송 실패: requestId={}", requestId, e);

			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", "기사 지명 요청 전송에 실패했습니다: " + e.getMessage());

			return ResponseEntity.badRequest().body(response);
		}
	}

	/**
	 * 🔄 일반 요청과 기사 지명 요청 구분
	 * 
	 * @param requestId 배송 요청 ID
	 * @return 요청 타입 정보
	 */
	@GetMapping("/requests/{requestId}/type")
	public ResponseEntity<Map<String, Object>> getRequestType(@PathVariable Long requestId) {
		try {
			boolean isDriverSpecific = requestService.isDriverSpecificRequest(requestId);

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("isDriverSpecific", isDriverSpecific);
			response.put("requestType", isDriverSpecific ? "기사 지명 요청" : "일반 요청");

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("요청 타입 확인 실패: requestId={}", requestId, e);

			Map<String, Object> response = new HashMap<>();
			response.put("success", false);
			response.put("message", "요청 타입 확인에 실패했습니다: " + e.getMessage());

			return ResponseEntity.badRequest().body(response);
		}
	}

	/* ============== DTO 클래스들 ============== */

	/**
	 * 기사 지명 요청 요청 DTO
	 */
	public static class DriverSpecificRequestRequest {
		private PaymentDTO paymentDto;
		private DeliveryRequestRequestDTO requestDto;
		private Long driverId;

		// Getters and Setters
		public PaymentDTO getPaymentDto() {
			return paymentDto;
		}

		public void setPaymentDto(PaymentDTO paymentDto) {
			this.paymentDto = paymentDto;
		}

		public DeliveryRequestRequestDTO getRequestDto() {
			return requestDto;
		}

		public void setRequestDto(DeliveryRequestRequestDTO requestDto) {
			this.requestDto = requestDto;
		}

		public Long getDriverId() {
			return driverId;
		}

		public void setDriverId(Long driverId) {
			this.driverId = driverId;
		}
	}

	/**
	 * 결제 완료 요청 DTO
	 */
	public static class PaymentCompletionRequest {
		private Long paymentId;

		// Getters and Setters
		public Long getPaymentId() {
			return paymentId;
		}

		public void setPaymentId(Long paymentId) {
			this.paymentId = paymentId;
		}
	}

	// ================================================[프론트 알림용 예외처리]
	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}
}
