package com.gpt.squirrelLogistics.repository.deliveryCargo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;

public interface DeliveryCargoRepository extends JpaRepository<DeliveryCargo, Long> {
    boolean existsByDeliveryWaypoint_WaypointId(Long waypointId);
    DeliveryCargo findByDeliveryWaypoint_WaypointId(Long waypointId);
    
    //작성자: 김도경
    //기능: requestId를 통한 총 거리, 무게, 예상 금액, 경유지 갯수, 추가금 얻기
	@Query("SELECT r.distance, r.totalCargoWeight, r.estimatedFee, " +
			"COUNT(dw.dropOrder), ct.extraFee, ct.handlingId "+
            "FROM DeliveryCargo dc " +
			"JOIN dc.cargoType ct "+
            "JOIN dc.deliveryWaypoint dw " +
            "JOIN dw.deliveryRequest r " +
            "WHERE r.requestId = :requestId "+
            "GROUP BY r.requestId, r.distance, r.totalCargoWeight, r.estimatedFee, ct.extraFee, ct.handlingId")
    List<Object[]> findEstimatedCalcByRequestId(@Param("requestId") Long requestId);

}
