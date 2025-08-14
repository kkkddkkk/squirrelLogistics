package com.gpt.squirrelLogistics.repository.deliveryWaypoint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;

public interface DeliveryWaypointRepository extends JpaRepository<DeliveryWaypoint, Long> {

	List<DeliveryWaypoint> findAllByDeliveryRequest_RequestId(Long requestId);
	
	
	//운송기록 ID로 경유지 목록 찾기
	@Query("SELECT dw.dropOrder, dw.address " +
		       "FROM DeliveryWaypoint dw " +
		       "JOIN dw.deliveryRequest dr " +
		       "WHERE dr = (SELECT d.deliveryRequest FROM DeliveryAssignment d WHERE d.assignedId = :assignedId)")
		List<Object[]> findWaypointByAssignmentId(@Param("assignedId") String assignedId);
}
