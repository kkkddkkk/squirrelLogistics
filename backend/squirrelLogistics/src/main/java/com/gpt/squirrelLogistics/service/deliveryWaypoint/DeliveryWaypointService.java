package com.gpt.squirrelLogistics.service.deliveryWaypoint;

import java.util.List;

import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;

public interface DeliveryWaypointService {

	//경유지 정보 생성(작성자: 고은설).
	Long create(DeliveryWaypointRequestDTO dto);
	//일괄 생성(작성자: 고은설).
	void createBatch(Long requestId, List<DeliveryWaypointRequestDTO> dtos);
	
	//개볅 경유지 데이터 간략하게 읽기(작성자: 고은설).
	DeliveryWaypointSlimResponseDTO readSlim(Long waypointId);

	//운송 요청 번호에 해당하는 모든 경유지 데이터 가져오기(작성자: 고은설).
	List<DeliveryWaypointSlimResponseDTO> readAll(long requestId);

	//경유지 개별 정보/상태 업데이트(작성자: 고은설).
	void update(Long waypointId, DeliveryWaypointRequestDTO dto);

	//경유지 엔티티 삭제(작성자: 고은설).
	void delete(Long waypointId);
	

}
