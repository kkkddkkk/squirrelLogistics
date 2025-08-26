package com.gpt.squirrelLogistics.repository.deliveryTrackingLog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.entity.deliveryTrackingLog.DeliveryTrackingLog;

public interface DeliveryTrackingLogRepository extends JpaRepository<DeliveryTrackingLog, Long> {

	// 작성자: 고은설.
	// 기능: assignedId에 해당하는 모든 추적로그 리턴.
	@Query("""
			    select new com.gpt.squirrelLogistics.common.LatLng(
			 t.lat,
			 t.lng
			    )
			    from DeliveryTrackingLog t
			    where t.deliveryAssignment.assignedId = :assignedId
			    order by t.createdAt asc
			""")
	List<LatLng> findPathByAssignedId(@Param("assignedId") Long assignedId);

	// 작성자: 고은설.
	// 기능: assignedId에 해당하는 모든 추적로그 삭제.
	void deleteByDeliveryAssignment_AssignedId(Long assignedId);
}
