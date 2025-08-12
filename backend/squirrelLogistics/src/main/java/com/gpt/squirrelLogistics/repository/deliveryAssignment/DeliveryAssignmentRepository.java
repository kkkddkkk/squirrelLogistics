package com.gpt.squirrelLogistics.repository.deliveryAssignment;

<<<<<<< HEAD
=======
import java.time.LocalDateTime;
import java.util.List;

>>>>>>> feature/review+report/GPT-30
import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
<<<<<<< HEAD

=======
	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);
>>>>>>> feature/review+report/GPT-30
}
