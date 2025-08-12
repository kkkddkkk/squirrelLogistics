package com.gpt.squirrelLogistics.repository.deliveryTrackingLog;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryTrackingLog.DeliveryTrackingLog;

public interface DeliveryTrackingLogRepository extends JpaRepository<DeliveryTrackingLog, Long> {

}
