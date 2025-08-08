package com.gpt.squirrelLogistics.repository.deliverySchedule;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliverySchedule.DeliverySchedule;

public interface DeliveryScheduleRepository extends JpaRepository<DeliverySchedule, Long> {

}
