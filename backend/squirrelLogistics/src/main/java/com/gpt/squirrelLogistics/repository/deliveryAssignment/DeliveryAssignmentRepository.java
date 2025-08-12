package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

}
