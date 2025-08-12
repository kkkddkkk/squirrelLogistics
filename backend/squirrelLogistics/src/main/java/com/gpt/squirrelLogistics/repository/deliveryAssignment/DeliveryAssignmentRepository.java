package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);

}
