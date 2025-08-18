package com.gpt.squirrelLogistics.service.deliveryCargo;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoRequestDTO;

public interface DelilveryCargoService {

	Long create(Long waypointId, DeliveryCargoRequestDTO dto);

}
