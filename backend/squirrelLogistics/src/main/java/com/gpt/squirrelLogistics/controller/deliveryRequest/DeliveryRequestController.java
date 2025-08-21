package com.gpt.squirrelLogistics.controller.deliveryRequest;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryOrchestrator.DeliveryOrchestrator;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;

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

	public record CreateProposeRequest(@jakarta.validation.Valid PaymentDTO payment,
			@jakarta.validation.Valid DeliveryRequestRequestDTO request) {
	}

	// 생성
	@PostMapping
	public Long create(@Valid @RequestBody CreateProposeRequest payload) {

		return requestService.create(payload.payment(), payload.request());
	}

	// 단건 조회 (상세 응답 사용 권장)
	@GetMapping("/{id}")
	@TimedEndpoint("request_detail") // ★ 상세만 타겟팅
	public ResponseEntity<DeliveryRequestResponseDTO> read(@PathVariable("id") Long id,
			@RequestParam(value = "driverId", required = false) Long driverId) throws NotFoundException {

		DeliveryRequestResponseDTO dto = requestService.readFullSafe(id, driverId);
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
	@GetMapping
	@TimedEndpoint("request_list")
	public ResponseEntity<PageResponseDTO<DeliveryRequestCardSlimDTO>> list(
			@ModelAttribute PageRequestDTO pageReq) {
		PageResponseDTO<DeliveryRequestCardSlimDTO> page = requestService.list(pageReq);
		return ResponseEntity.ok(page);
	}

	/** 목록 - Spring 표준 Pageable(Page<T>) */
	@GetMapping("/page")
	public Page<DeliveryRequestSlimResponseDTO> getPage(Pageable pageable) {
		return requestService.getPage(pageable);
	}

	// 요청 승낙
	@PutMapping("/{id}/accept")
	public ResponseEntity<Map<String, String>> accept(@PathVariable("id") Long requestId,
			@RequestParam("driverId") Long driverId) {

		Map<String, String> result = assignmentService.accept(requestId, driverId);

		if (result.containsKey("FAILED")) {
			HttpStatus s = switch (result.get("FAILED")) {
			case "REQUEST_NOT_FOUND", "DRIVER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
			case "REQUEST_ALREADY_TAKEN", "VEHICLE_TYPE_MISMATCH", "SCHEDULE_CONFLICT" -> HttpStatus.CONFLICT;
			default -> HttpStatus.BAD_REQUEST;
			};
			return ResponseEntity.status(s).body(result);
		}
		return ResponseEntity.ok(result);
	}

	// 요청 생성과 동시에 지명 제안, 물류회사 전용.
	@PostMapping("/propose")
	public ResponseEntity<Map<String, Object>> createAndPropose(@Valid @RequestBody CreateProposeRequest payload,
			@RequestParam("driverId") Long driverId) {

		Map<String, Object> result = deliveryOrchestrator.createAndPropose(payload.request(), payload.payment(),
				driverId);

		if (result.containsKey("FAILED")) {
			HttpStatus s = switch (String.valueOf(result.get("FAILED"))) {
			case "DRIVER_NOT_FOUND", "COMPANY_NOT_FOUND", "VEHICLE_TYPE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
			case "VALIDATION_ERROR" -> HttpStatus.BAD_REQUEST;
			default -> HttpStatus.CONFLICT;
			};
			return ResponseEntity.status(s).body(result);
		}
		return ResponseEntity.ok(result);
	}

}
