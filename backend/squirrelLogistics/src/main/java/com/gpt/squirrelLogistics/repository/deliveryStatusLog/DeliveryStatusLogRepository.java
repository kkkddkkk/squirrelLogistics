package com.gpt.squirrelLogistics.repository.deliveryStatusLog;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;

public interface DeliveryStatusLogRepository extends JpaRepository<DeliveryStatusLog, Long> {

}
