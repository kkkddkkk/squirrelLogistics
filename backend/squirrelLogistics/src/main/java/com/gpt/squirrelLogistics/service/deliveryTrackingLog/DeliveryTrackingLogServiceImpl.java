package com.gpt.squirrelLogistics.service.deliveryTrackingLog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.entity.deliveryTrackingLog.DeliveryTrackingLog;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryTrackingLog.DeliveryTrackingLogRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryTrackingLogServiceImpl implements DeliveryTrackingLogService {
	
	 private final DeliveryTrackingLogRepository trackRepo;
	 private final DeliveryAssignmentRepository assignRepo;

	 
	@Override
	@Transactional
    public void save(String driverId, Long assignedId, LatLng pos) {
		var ref = assignRepo.getReferenceById(assignedId);
        var log = DeliveryTrackingLog.builder()
                .deliveryAssignment(ref)
                .lat(BigDecimal.valueOf(pos.getLat()))
                .lng(BigDecimal.valueOf(pos.getLng()))
                .createdAt(LocalDateTime.now())
                .build();
        trackRepo.save(log);
    }
}
