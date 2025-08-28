package com.gpt.squirrelLogistics.repository.deliveryWaypoint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointTrackingDTO;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;

public interface DeliveryWaypointRepository extends JpaRepository<DeliveryWaypoint, Long> {

	List<DeliveryWaypoint> findAllByDeliveryRequest_RequestId(Long requestId);

	List<DeliveryWaypoint> findByDeliveryRequest_RequestIdOrderByDropOrderAsc(Long requestId);

	// 운송기록 ID로 경유지 목록 찾기
		@Query("SELECT dw.address " +
			       "FROM DeliveryWaypoint dw " +
			       "JOIN dw.deliveryRequest dr " +
			       "WHERE dr = (SELECT d.deliveryRequest FROM DeliveryAssignment d WHERE d.assignedId = :assignedId) " +
			       "ORDER BY dw.dropOrder ASC")
			List<String> findWaypointsByAssignmentId(@Param("assignedId") Long assignedId);
		
	//requestID로 경유지 목록 찾기
	@Query("SELECT dw.address " +
			  "FROM DeliveryWaypoint dw " +
			  "JOIN dw.deliveryRequest dr " +
			  "WHERE dr.requestId = :requestId " +
			  "ORDER BY dw.dropOrder ASC")
			List<String> findWaypointsByRequestId(@Param("requestId") Long requestId);

	@Query("""
			select w from DeliveryWaypoint w
			where w.deliveryRequest.requestId = :id
			order by w.dropOrder asc
			""")
	List<DeliveryWaypoint> findAllByRequestIdOrderByDrop(@Param("id") Long id);

	@Query("""
			select new com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointTrackingDTO(
			  w.waypointId, w.dropOrder, w.address, null
			)
			from DeliveryWaypoint w
			where w.deliveryRequest.requestId = :requestId
			order by w.dropOrder asc
			""")
	List<DeliveryWaypointTrackingDTO> findRowsByRequestId(@Param("requestId") Long requestId);

	@Query("""
			  select w
			  from DeliveryWaypoint w
			  where w.deliveryRequest.requestId = :requestId
			  order by w.dropOrder asc
			""")
	List<DeliveryWaypoint> findAllByRequestIdOrderByDropOrderAsc(@Param("requestId") Long requestId);

	@Query("""
			  select count(w) from DeliveryWaypoint w
			  where w.deliveryRequest.requestId = :requestId
			""")
	long countByRequestId(@Param("requestId") Long requestId);

}
