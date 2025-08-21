package com.gpt.squirrelLogistics.repository.deliveryStatusLog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;

public interface DeliveryStatusLogRepository extends JpaRepository<DeliveryStatusLog, Long> {

	@Query("""
			  select new com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO(
			      l.statusId,
			      l.createdAt,
			      l.lastVisitedWaypoint,
			      l.status,
			      da.assignedId
			  )
			  from DeliveryStatusLog l
			  join l.deliveryAssignment da
			  join da.deliveryRequest dr
			  where dr.requestId = :requestId
			  order by l.createdAt asc
			  """)
	List<DeliveryStatusLogSlimResponseDTO> findStatusRowsByRequestId(@Param("requestId") Long requestId);

	// 최신 1건 (Pageable로 1건만 가져오기)
	List<DeliveryStatusLog> findByDeliveryAssignment_DeliveryRequest_RequestIdOrderByCreatedAtDescStatusIdDesc(
		    Long requestId,
		    org.springframework.data.domain.Pageable pageable
		);
	
	
	
	Optional<DeliveryStatusLog> findFirstByDeliveryAssignment_AssignedIdOrderByCreatedAtDescStatusIdDesc(Long assignedId);
}
