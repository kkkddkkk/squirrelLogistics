package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
<<<<<<< Updated upstream
	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);
=======

	List<DeliveryAssignment> findByCompletedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

>>>>>>> Stashed changes
}
