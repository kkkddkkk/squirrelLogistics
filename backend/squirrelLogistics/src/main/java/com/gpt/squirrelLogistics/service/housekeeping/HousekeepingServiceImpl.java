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
	private static final long MAX_ALLOW_TIME = 30; //30분까지 봐줌.
	
	@Override
	public void sweep() {

		// 운송 요청, 운송 할당 CRUD이전에 선행되어야 하는 상태값 전환 로직 모음.

	    final var now = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Seoul")).toLocalDateTime();


	    // ========= 제안된 기간 내 매칭 실패한 요청 게시글 정리.
	    
	    // 만기 요청에 대한 선결제 환불 처리.
	    runStep("CANCEL_PROPOSALS",                  assignmentRepo::cancelExpiredProposals,                now);
	    runStep("REFUND_PAYMENTS",                   paymentRepo::refundForRequestsWithoutActiveProposals,  now);
	    // 지명 제안 만기된 운송 요청 제안됨 => 공개됨으로 상태 전환.
	    runStep("REOPEN_AND_DETACH",                 requestRepo::reopenAndDetachPaymentForRequestsNative,  now);
	    
	    // 약속된 마감일까지 complete안된 건 fail처리 및 신고 접수.
        runStep("FAIL_OVERDUE_INPROGRESS", this::failOverdueInProgress, now);

	    // 금일 시작일로 예정된 운송 할당, 할당됨 => 진행중으로 전환.
	    runStep("MARK_IN_PROGRESS",                  assignmentRepo::markAssignedToInProgress,              now);
	    //runStep("FAIL_EXPIRED_REQUESTS",             requestRepo::failExpiredUnassignedRequests,            now);
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
	            log.info("[SWEEP] {} affected={} ({} ms)", name, affected, ms);
	            return affected;
	        } catch (DeadlockLoserDataAccessException | CannotAcquireLockException e) {
	            if (attempt == MAX_RETRY) {
	                log.error("[SWEEP] {} failed after {} retries: {}", name, MAX_RETRY, e.getMessage(), e);
	                return 0;
	            }
	            try { Thread.sleep(BACKOFF_MS * attempt); } catch (InterruptedException ignored) {}
	            log.warn("[SWEEP] {} retrying... attempt={}", name, attempt + 1);
	        } catch (DataAccessException e) {
	            log.error("[SWEEP] {} data access error: {}", name, e.getMessage(), e);
	            return 0;
	        } catch (RuntimeException e) {
	            log.error("[SWEEP] {} failed: {}", name, e.getMessage(), e);
	            return 0;
	        }
	    }
	    return 0; // 여기는 도달하지 않음
	}
	
	
	//
	// REQUIRES_NEW 트랜잭션으로 호출됨(runStep)
    private Integer failOverdueInProgress(LocalDateTime now) {
        // wantToEnd < (now - GRACE)  ≡  wantToEnd + GRACE < now
        var threshold = now.minusMinutes(MAX_ALLOW_TIME);

        var list = assignmentRepo.findInProgressPastEnd(threshold);
        int affected = 0;

        for (var a : list) {
            var cur = a.getStatus();
            
            if (cur != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS) continue;
    
            //실패 상태로 assign 전환.
            a.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.FAILED);
            a.setCompletedAt(now); //종료 시각 용도.
        
            //신고 접수.
            var cate = ReportCategoryEnum.UNEXECUTED; 
            var r = makeSystemReport(a, cate, now);
            reportRepo.save(r);

            affected++;
        }
        return affected;
    }

    private DeliveryStatusEnum safeTimedOutOrOnHold() {
        try {
            return DeliveryStatusEnum.valueOf("TIMED_OUT"); // 있으면 사용
        } catch (IllegalArgumentException e) {
            return DeliveryStatusEnum.ON_HOLD; // 대체
        }
    }

    private Report makeSystemReport(DeliveryAssignment a, ReportCategoryEnum cate, LocalDateTime now) {
        var req = a.getDeliveryRequest();
        var driverName = (a.getDriver() != null ? a.getDriver().getUser().getName() : "Unknown Driver");
        var title = "[자동 실패] 운송 미실행/미완료 (기한 초과)";
        var content = new StringBuilder()
                .append("시스템 자동 실패 처리\n")
                .append("- AssignedId: ").append(a.getAssignedId()).append('\n')
                .append("- Driver: ").append(driverName).append('\n')
                .append("- RequestId: ").append(req != null ? req.getRequestId() : "N/A").append('\n')
                .append("- WantToStart: ").append(req != null ? req.getWantToStart() : "N/A").append('\n')
                .append("- WantToEnd: ").append(req != null ? req.getWantToEnd() : "N/A").append('\n')
                .append("- 처리시각: ").append(now).append('\n')
                .append("- 비고: 종료시간 + ").append(MAX_ALLOW_TIME).append("분 유예 초과 시 자동 실패").toString();

        return Report.builder()
                .deliveryAssignment(a)
                .reporter(ReportReporterEnum.SYSTEM)
                .rTitle(title)
                .rContent(content)
                .rStatus(ReportStatusEnum.PENDING) 
                .rCate(cate)               
                .regDate(now)
                .build();
    }
	
	
}
