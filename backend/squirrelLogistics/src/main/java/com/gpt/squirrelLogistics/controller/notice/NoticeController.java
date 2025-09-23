package com.gpt.squirrelLogistics.controller.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeDetailRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeSlimCardDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.service.admin.AdminTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;
import com.gpt.squirrelLogistics.service.notice.NoticeServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

	private final NoticeServiceImpl service;
	private final AdminTokenValidService tokenValidService;

	@PostMapping
	public ResponseEntity<?> create(@Valid @RequestBody NoticeRequestDTO req,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		// 토큰 검증.
		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
		if (firstOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		// 관리자 검증.
		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
		if (seconOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		// 토큰으로부터 확인된 어드민 아이디 요청 객체에 부착.
		Long adminId = ((AuthOutcome.Success) seconOutcome).Id();
		req.setAdminId(adminId);

		Long id = service.create(req);
		return ResponseEntity.ok(id);
	}

	// 작성자: 고은설.
	// 기능: 목록 (검색 + pinned 상단 + 최신순).
	@GetMapping
	public ResponseEntity<?> list(@ModelAttribute RequestPageRequestDTO req,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		// 토큰 검증 => 1차 검증만, 목록은 일반 유저/관리자 모두 조회 가능.
//		AuthOutcome outcome = tokenValidService.resolve(authHeader);
//		if (outcome instanceof AuthOutcome.Failure f)
//			return toError(f);

		return ResponseEntity.ok(service.list(req));
	}

	// 작성자: 고은설.
	// 기능: 기존 공지 수정.
	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable("id") Long id,
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@Valid @RequestBody NoticeRequestDTO req) {

		// 토큰 검증.
		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
		if (firstOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		// 관리자 검증.
		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
		if (seconOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		service.update(id, req);
		return ResponseEntity.noContent().build();
	}

	// 작성자: 고은설.
	// 기능: 단건 공지 조회.
	@GetMapping("/{id}")
	public ResponseEntity<?> getOne(@PathVariable("id") Long id,
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			 @RequestParam(name = "increaseView", defaultValue = "true") boolean increaseView) {

		// 토큰 검증 => 1차 검증만, 상세 공지는 일반 유저/관리자 모두 조회 가능.
//		AuthOutcome outcome = tokenValidService.resolve(authHeader);
//		if (outcome instanceof AuthOutcome.Failure f)
//			return toError(f);

		return ResponseEntity.ok(service.getOne(id, increaseView));
	}

	// 작성자: 고은설.
	// 기능: 기존 공지 삭제.
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") Long id,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// 토큰 검증.
		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
		if (firstOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		// 관리자 검증.
		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
		if (seconOutcome instanceof AuthOutcome.Failure f)
			return toError(f);

		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/pin")
	public ResponseEntity<?> togglePin(
	    @PathVariable("id") Long id,
	    @RequestHeader(value = "Authorization", required = false) String authHeader,
	    @RequestParam("pinned") boolean pinned // ✅ boolean 단독 (쿼리 파라미터)
	) {
	    // 토큰 검증
//	    AuthOutcome first = tokenValidService.resolve(authHeader);
//	    if (first instanceof AuthOutcome.Failure f) return toError(f);
//
//	    Long userId = ((AuthOutcome.Success) first).Id();
//	    AuthOutcome second = tokenValidService.getAdmin(userId);
//	    if (second instanceof AuthOutcome.Failure f) return toError(f);

	    service.setPinned(id, pinned);
	    return ResponseEntity.noContent().build();
	}
	
	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}

}
