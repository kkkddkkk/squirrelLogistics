package com.gpt.squirrelLogistics.service.housekeeping;

import java.time.LocalDateTime;
import java.util.function.Function;
import java.util.function.Supplier;

import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DeadlockLoserDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;
import com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class HousekeepingServiceImpl implements HousekeepingService {

	private final DeliveryAssignmentRepository assignmentRepo;
	private final PaymentRepository paymentRepo;
	private final DeliveryRequestRepository requestRepo;
	private final ReportRepository reportRepo;

	private final PlatformTransactionManager txm;

	private static final int PROPOSAL_HOURS = 2; // WANT TO START기준 얼마 전까지 지명 제안 만료 처리 시길건지/
	private static final long MAX_ALLOW_MINUTES = 12 * 60; // 12시간
	private static final int UNMATCHED_GRACE_HOURS = 12; // 미매칭 요청 유예시간.

	@Override
	public void sweep() {

		final var now = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Seoul")).toLocalDateTime();
		final var proposalDeadline = now.plusHours(PROPOSAL_HOURS); // 제안 만료 기준.
		final var unmatchedThreshold = now.minusHours(UNMATCHED_GRACE_HOURS); // 미매칭 기준.

		// 지명 만료 처리.
		runStep("CANCEL_EXPIRED_PROPOSALS", t -> assignmentRepo.cancelExpiredProposalsByStart(t, proposalDeadline),
				now);

		// 지명 해제된 요청 공개 전환.
		runStep("REOPEN_PROPOSED_TO_REGISTERED", t -> requestRepo.reopenProposedToRegisteredByStart(proposalDeadline),
				now);

		//IN_PROGRESS인데 12시간 내 착수 이력 없는 건 FAIL + 신고(불량 운송건).
		runStep("FAIL_OVERDUE_NOT_STARTED", this::failNotStarted, now);

		// want_to_start + 12h 지나도 매칭 안 된 요청 FAIL(자연 만료건).
		runStep("FAIL_UNMATCHED", t -> requestRepo.failUnmatchedRequestsBefore(unmatchedThreshold), now);

		// 금일 시작되는 할당 ASSIGNED → IN_PROGRESS.
		runStep("MARK_ASSIGNED_TO_INPROGRESS", assignmentRepo::markAssignedToInProgress, now);
	}

	private int runStep(String name, Function<LocalDateTime, Integer> step, LocalDateTime now) {
		final int MAX_RETRY = 3;
		final long BACKOFF_MS = 150L;

		var tpl = new TransactionTemplate(txm);
		tpl.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
		tpl.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
		tpl.setTimeout(10); // 초

		long t0 = System.currentTimeMillis();
		for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
			try {
				Integer n = tpl.execute(status -> {
					try {
						return step.apply(now);
					} catch (RuntimeException e) {
						status.setRollbackOnly();
						throw e;
					}
				});
				int affected = n != null ? n : 0;
				long ms = System.currentTimeMillis() - t0;
				return affected;
			} catch (DeadlockLoserDataAccessException | CannotAcquireLockException e) {
				if (attempt == MAX_RETRY) {
					return 0;
				}
				try {
					Thread.sleep(BACKOFF_MS * attempt);
				} catch (InterruptedException ignored) {
				}
			} catch (DataAccessException e) {
				return 0;
			} catch (RuntimeException e) {
				return 0;
			}
		}
		return 0; // 여기는 도달하지 않음
	}

	private int failNotStarted(LocalDateTime now) {
		var threshold = now.minusMinutes(MAX_ALLOW_MINUTES);
		var list = assignmentRepo.findInProgressNotStartedBefore(threshold);
		int affected = 0;
		for (var a : list) {
			a.setStatus(StatusEnum.FAILED);
			a.setCompletedAt(now);
			reportRepo.save(makeSystemReport(a, ReportCategoryEnum.UNEXECUTED, now));
			affected++;
		}
		return affected;
	}

	private Report makeSystemReport(DeliveryAssignment a, ReportCategoryEnum cate, LocalDateTime now) {
		var req = a.getDeliveryRequest();
		var driverName = (a.getDriver() != null ? a.getDriver().getUser().getName() : "Unknown Driver");
		var title = "[자동 실패] 운송 미실행/미완료 (기한 초과)";
		var content = new StringBuilder().append("시스템 자동 실패 처리\n").append("- AssignedId: ").append(a.getAssignedId())
				.append('\n').append("- Driver: ").append(driverName).append('\n').append("- RequestId: ")
				.append(req != null ? req.getRequestId() : "N/A").append('\n').append("- WantToStart: ")
				.append(req != null ? req.getWantToStart() : "N/A").append('\n').append("- WantToEnd: ").append('\n')
				.append("- 비고: 종료시간 + ").append(MAX_ALLOW_MINUTES).append("분 유예 초과 시 자동 실패").toString();

		return Report.builder().deliveryAssignment(a).reporter(ReportReporterEnum.SYSTEM).rTitle(title)
				.rContent(content).rStatus(ReportStatusEnum.PENDING).rCate(cate).regDate(now).build();
	}

}
