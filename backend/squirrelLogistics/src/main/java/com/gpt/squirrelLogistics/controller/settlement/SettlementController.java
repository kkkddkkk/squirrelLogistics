package com.gpt.squirrelLogistics.controller.settlement;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.settlement.MethodAggDTO;
import com.gpt.squirrelLogistics.dto.settlement.SettleRequestDTO;
import com.gpt.squirrelLogistics.dto.settlement.SummaryDTO;
import com.gpt.squirrelLogistics.dto.settlement.TrendBucketDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledPageRequestDTO;
import com.gpt.squirrelLogistics.service.admin.AdminTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.settlement.SettlementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

	protected final AdminTokenValidService tokenValidService;
	private final SettlementService service;

	// 기능: 최상단 이번달 재무지표 집계 CardStat렌더링용.
	@GetMapping("/summary")
	public ResponseEntity<?> monthlySummary(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(name = "month") String month) {

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

		YearMonth ym = YearMonth.parse(month);
		ZoneId zone = ZoneId.of("Asia/Seoul");
		ZonedDateTime start = ym.atDay(1).atStartOfDay(zone);
		ZonedDateTime end = start.plusMonths(1);
		SummaryDTO dto = service.getMonthlySummary(start.toInstant(), end.toInstant(), ym.toString());

		return ResponseEntity.ok(dto);
	}

	// 기능: 미정산 버튼 위 표시할 미정산수, 미정산액 표시용.
	@GetMapping("/unsettled")
	public ResponseEntity<?> unsettledSummary(
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

//		// 토큰 검증.
//		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
//		if (firstOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 관리자 검증.
//		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
//		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
//		if (seconOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 토큰으로부터 확인된 어드민 아이디 요청 객체에 부착.
//		Long adminId = ((AuthOutcome.Success) seconOutcome).Id();

		UnsettledDTO dto = service.getUnsettledSummary();
		return ResponseEntity.ok(dto);
	}

	// 기능: 결제수단별 매출 그래프 출력용.
	@GetMapping("/by-method")
	public ResponseEntity<?> byMethod(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(name = "from") String from, @RequestParam(name = "to") String to) {

//		// 토큰 검증.
//		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
//		if (firstOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 관리자 검증.
//		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
//		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
//		if (seconOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 토큰으로부터 확인된 어드민 아이디 요청 객체에 부착.
//		Long adminId = ((AuthOutcome.Success) seconOutcome).Id();

		Instant f = Instant.parse(from);
		Instant t = Instant.parse(to);
		List<MethodAggDTO> list = service.getByMethod(f, t);
		return ResponseEntity.ok(list);
	}

	// 기능: 기간별 매출 그래프 출력용.
	@GetMapping("/trend")
	public ResponseEntity<?> trend(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(name = "from") String from, @RequestParam(name = "to") String to,
			@RequestParam(name = "interval") String interval // DAY|WEEK|MONTH
	) {

//		// 토큰 검증.
//		AuthOutcome firstOutcome = tokenValidService.resolve(authHeader);
//		if (firstOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 관리자 검증.
//		Long userId = ((AuthOutcome.Success) firstOutcome).Id();
//		AuthOutcome seconOutcome = tokenValidService.getAdmin(userId);
//		if (seconOutcome instanceof AuthOutcome.Failure f)
//			return toError(f);
//
//		// 토큰으로부터 확인된 어드민 아이디 요청 객체에 부착.
//		Long adminId = ((AuthOutcome.Success) seconOutcome).Id();

		Instant f = Instant.parse(from);
		Instant t = Instant.parse(to);
		Interval iv = Interval.valueOf(interval); // enum
		List<TrendBucketDTO> list = service.getTrend(f, t, iv);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/payments")
	public ResponseEntity<?> page(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@ModelAttribute UnsettledPageRequestDTO req) {

		// 1) 인증/관리자 검증
		AuthOutcome a1 = tokenValidService.resolve(authHeader);
		if (a1 instanceof AuthOutcome.Failure f)
			return toError(f);
		Long uid = ((AuthOutcome.Success) a1).Id();
		AuthOutcome a2 = tokenValidService.getAdmin(uid);
		if (a2 instanceof AuthOutcome.Failure f)
			return toError(f);

		// 2) 정렬 파싱
		String sortKey = (req.getSortKey() != null && !req.getSortKey().isBlank()) ? req.getSortKey() : "paid,DESC";
		String[] parts = sortKey.split(",");
		Sort sort = (parts.length == 2) ? Sort.by(Sort.Direction.fromString(parts[1]), parts[0])
				: Sort.by("paid").descending();

		// 3) 페이징(1-based -> 0-based)
		int rawPage = req.getPage();      // primitive int
		int pageIdx = (rawPage <= 0) ? 0 : rawPage - 1;

		int rawSize = req.getSize();      // primitive int
		int size = (rawSize <= 0) ? 10 : rawSize;

		Pageable pageable = PageRequest.of(pageIdx, size,
		        sortKey.contains(",")
		                ? Sort.by(Sort.Direction.fromString(sortKey.split(",")[1]), sortKey.split(",")[0])
		                : Sort.by("paid").descending());

		// 4) 기간(KST) 파싱
		LocalDateTime start = req.getStartKst();
		LocalDateTime end = req.getEndKst();

		// 5) 필터 기본값
		String method = (req.getMethod() == null) ? "all" : req.getMethod();
		String settle = (req.getSettle() == null) ? "unsettled" : req.getSettle();

		// 6) 서비스 호출
		var body = service.getPage(req);

		return ResponseEntity.ok(body);
	}

	@PostMapping("/settle")
	public ResponseEntity<?> settle(@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestBody SettleRequestDTO req) {
		// 토큰/관리자 검증
		AuthOutcome a1 = tokenValidService.resolve(authHeader);
		if (a1 instanceof AuthOutcome.Failure f)
			return toError(f);
		Long uid = ((AuthOutcome.Success) a1).Id();
		AuthOutcome a2 = tokenValidService.getAdmin(uid);
		if (a2 instanceof AuthOutcome.Failure f)
			return toError(f);

		return service.settlePayments(req);
	}

	public enum Interval {
		DAY, WEEK, MONTH
	}

	protected ResponseEntity<?> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(f.message());
	}

}
