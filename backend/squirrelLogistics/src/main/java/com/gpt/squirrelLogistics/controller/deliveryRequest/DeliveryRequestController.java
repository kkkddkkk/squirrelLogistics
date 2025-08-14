package com.gpt.squirrelLogistics.controller.deliveryRequest;

import java.net.URI;
import java.util.List;

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

import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/request")
@RequiredArgsConstructor
@Log4j2
public class DeliveryRequestController {

	private final DeliveryRequestService requestService;

	// 생성
	@PostMapping
	public Long create(@Valid @RequestBody DeliveryRequestRequestDTO dto) {

		return requestService.create(dto);
	}

	// 단건 조회 (상세 응답 사용 권장)
	@GetMapping("/{id}")
    @TimedEndpoint("request_detail")  // ★ 상세만 타겟팅
	public ResponseEntity<DeliveryRequestResponseDTO> read(@PathVariable("id") Long id) {

		DeliveryRequestResponseDTO dto = requestService.readFull(id);
		return ResponseEntity.ok(dto);
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
	public ResponseEntity<PageResponseDTO<DeliveryRequestSlimResponseDTO>> list(
			@ModelAttribute PageRequestDTO pageReq) {
		PageResponseDTO<DeliveryRequestSlimResponseDTO> page = requestService.list(pageReq);
		return ResponseEntity.ok(page);
	}
}
