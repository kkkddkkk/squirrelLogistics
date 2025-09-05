package com.gpt.squirrelLogistics.dto.deliveryWaypoint;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DeliveryWaypointWithCargoDTO {
    private DeliveryWaypointSlimResponseDTO waypoint;
    private LocalDateTime droppedAtFromLog;
    private DeliveryCargoSlimResponseDTO cargo;
}
