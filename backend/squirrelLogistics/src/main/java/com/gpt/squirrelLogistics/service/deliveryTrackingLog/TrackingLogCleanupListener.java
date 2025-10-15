package com.gpt.squirrelLogistics.service.deliveryTrackingLog;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.gpt.squirrelLogistics.repository.deliveryTrackingLog.DeliveryTrackingLogRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.AssignmentCompletedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
@RequiredArgsConstructor
public class TrackingLogCleanupListener {
	private final DeliveryTrackingLogRepository repo;

	@Transactional
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void onCompleted(AssignmentCompletedEvent e) {
		int n = repo.deleteByAssignedId(e.assignedId()); // 커밋 뒤라 clear 불필요
		log.info("purged {} tracking logs for assignedId={}", n, e.assignedId());
	}
}
