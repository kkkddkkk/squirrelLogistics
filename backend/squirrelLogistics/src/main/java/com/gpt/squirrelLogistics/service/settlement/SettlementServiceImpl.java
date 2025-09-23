package com.gpt.squirrelLogistics.service.settlement;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.controller.settlement.SettlementController.Interval;
import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.settlement.MethodAggDTO;
import com.gpt.squirrelLogistics.dto.settlement.SettleRequestDTO;
import com.gpt.squirrelLogistics.dto.settlement.SettleResultDTO;
import com.gpt.squirrelLogistics.dto.settlement.SummaryDTO;
import com.gpt.squirrelLogistics.dto.settlement.TrendBucketDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledPageRequestDTO;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;
import com.gpt.squirrelLogistics.repository.settlement.SettlementRepository;
import com.gpt.squirrelLogistics.service.driverAuth.AuthErrorCode;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

	private final SettlementRepository repo;

	private static final ZoneId Z_KST = ZoneId.of("Asia/Seoul");
	private static final DateTimeFormatter F_DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter F_WEEK = DateTimeFormatter.ofPattern("YYYY-'W'ww");
	private static final DateTimeFormatter F_MONTH = DateTimeFormatter.ofPattern("yyyy-MM");

	private static LocalDateTime toKstLdt(Instant i) {
		return LocalDateTime.ofInstant(i, Z_KST);
	}

	private PaymentDTO toDto(Payment e) {
		PaymentDTO dto = new PaymentDTO();
		dto.setPaymentId(e.getPaymentId());
		dto.setPayAmount(e.getPayAmount());
		dto.setPayMethod(e.getPayMethod());
		dto.setSettlementFee(e.getSettlementFee());
		dto.setSettlement(e.isSettlement());
		dto.setPaid(e.getPaid());
		dto.setImpUid(e.getImpUid());
		dto.setPayStatus(e.getPayStatus() != null ? e.getPayStatus() : null);
		return dto;
	}

	private Sort resolveSort(String sortKey) {
		if (sortKey == null || sortKey.isBlank())
			return Sort.by("paid").descending();
		String[] parts = sortKey.split(",");
		if (parts.length == 2) {
			return Sort.by(Sort.Direction.fromString(parts[1]), parts[0]);
		}
		return Sort.by(parts[0]).descending();
	}

	@Override
	public SummaryDTO getMonthlySummary(Instant start, Instant end, String monthLabel) {
		var r = repo.sumMonthly(toKstLdt(start), toKstLdt(end));
		long gross = nvl(r.getGross());
		long fee = nvl(r.getFee());
		return new SummaryDTO(monthLabel, gross, fee, gross - fee, nvlInt(r.getCompletedCount()));
	}

	@Override
	public UnsettledDTO getUnsettledSummary() {
		var r = repo.sumUnsettled();
		return new UnsettledDTO(nvlInt(r.getCount()), nvl(r.getAmount()));
	}

	@Override
	public List<MethodAggDTO> getByMethod(Instant f, Instant t) {
		return repo.sumByMethod(toKstLdt(f), toKstLdt(t)).stream().map(r -> new MethodAggDTO(r.getMethod(),
				nvl(r.getGross()), nvl(r.getFee()), nvl(r.getGross()) - nvl(r.getFee()))).toList();
	}

	@Override
	public List<TrendBucketDTO> getTrend(Instant f, Instant t, Interval iv) {
		var rows = switch (iv) {
		case DAY -> repo.sumTrendDay(toKstLdt(f), toKstLdt(t));
		case WEEK -> repo.sumTrendWeek(toKstLdt(f), toKstLdt(t));
		case MONTH -> repo.sumTrendMonth(toKstLdt(f), toKstLdt(t));
		};
		return rows.stream().map(r -> {
			var kst = r.getBucket().atZone(Z_KST);
			var label = switch (iv) {
			case DAY -> F_DAY.format(kst);
			case WEEK -> F_WEEK.format(kst);
			case MONTH -> F_MONTH.format(kst);
			};
			long gross = nvl(r.getGross()), fee = nvl(r.getFee());
			return new TrendBucketDTO(kst.toOffsetDateTime().toString(), label, gross, fee, gross - fee);
		}).toList();
	}

	@Override
	public RequestPageResponseDTO<PaymentDTO> getPage(UnsettledPageRequestDTO req) {

		int pageIdx = Math.max(req.getPage() - 1, 0);
		int size = Math.max(req.getSize(), 1);
		Sort sort = resolveSort(req.getSortKey());
		Pageable pageable = PageRequest.of(pageIdx, size, sort);

		// 기간
		LocalDateTime start = req.getStartKst();
		LocalDateTime end = req.getEndKst();

		List<String> statuses = List.of(PayStatusEnum.COMPLETED.name(), PayStatusEnum.ALLCOMPLETED.name());

		// 결제수단/정산상태 기본값
		String method = req.getMethod();
		if (method != null && method.isBlank())
			method = null; // 방어
		String settle = "settled".equalsIgnoreCase(req.getSettle()) ? "settled" : "unsettled";


		// 조회
		Page<Payment> entityPage = repo.findPaymentsPage(start, end, statuses, method, settle, pageable);

		List<PaymentDTO> list = entityPage.getContent().stream().map(this::toDto).toList();

		return RequestPageResponseDTO.<PaymentDTO>withAll().dtoList(list).pageRequestDTO(req)
				.totalCount(entityPage.getTotalElements()).build();
	}

	// 단일 30% 정책
	private long calc30(long amount) {
		return Math.round(amount * 0.30d);
	}

	public record SettleResultDTO(long batchId, int updatedCount, List<Long> updatedIds, long totalFee) {
	}

	@Transactional
	@Override
	public ResponseEntity<?> settlePayments(SettleRequestDTO req) {
		List<Payment> targets = repo.findSettleTargets(req.ids());
		if (targets.isEmpty())
			return ResponseEntity.status(404).body("해당 아이디의 결제 정보가 확인되지 않았습니다.");

		Map<Long, Long> overrideM = Optional.ofNullable(req.merchantFeeOverrideById()).orElse(Map.of());
		long batchId = System.currentTimeMillis();
		long totalFee = 0L;
		List<Long> updated = new ArrayList<>();

		for (Payment p : targets) {
			long amount = Optional.ofNullable(p.getPayAmount()).orElse(0L);
			long fee = overrideM.getOrDefault(p.getPaymentId(), calc30(amount));
			p.setSettlementFee(fee);
			p.setSettlement(true);
			updated.add(p.getPaymentId());
			totalFee += fee;
		}
		repo.saveAll(targets);
		return ResponseEntity.ok(new SettleResultDTO(batchId, updated.size(), updated, totalFee));
	}

	private static long nvl(Long v) {
		return v == null ? 0L : v;
	}

	private static int nvlInt(Integer v) {
		return v == null ? 0 : v;
	}

}
