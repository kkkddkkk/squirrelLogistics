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

import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class HousekeepingServiceImpl implements HousekeepingService {

	private final DeliveryAssignmentRepository assignmentRepo;
	private final PaymentRepository paymentRepo;
	private final DeliveryRequestRepository requestRepo;
	
	private final PlatformTransactionManager txm;

	@Override
	public void sweep() {

		// 운송 요청, 운송 할당 CRUD이전에 선행되어야 하는 상태값 전환 로직 모음.

	    final var now = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Seoul")).toLocalDateTime();

	    // 만기 요청에 대한 선결제 환불 처리.
	    // 지명 제안 만기된 운송 요청 제안됨 => 공개됨으로 상태 전환.

	    // 금일 시작일로 예정된 운송 할당, 할당됨 => 진행중으로 전환.
	    // ========= 제안된 기간 내 매칭 실패한 요청 게시글 정리.
	    
	    runStep("CANCEL_PROPOSALS",                  assignmentRepo::cancelExpiredProposals,                now);
	    runStep("REFUND_PAYMENTS",                   paymentRepo::refundForRequestsWithoutActiveProposals,  now);
	    runStep("REOPEN_AND_DETACH",                 requestRepo::reopenAndDetachPaymentForRequestsNative,  now);
	    runStep("MARK_IN_PROGRESS",                  assignmentRepo::markAssignedToInProgress,              now);
	    runStep("FAIL_EXPIRED_REQUESTS",             requestRepo::failExpiredUnassignedRequests,            now);
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
}
