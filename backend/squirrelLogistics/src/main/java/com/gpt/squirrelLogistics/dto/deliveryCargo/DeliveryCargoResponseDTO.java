package com.gpt.squirrelLogistics.dto.deliveryCargo;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.cargoType.CargoTypeDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryCargoResponseDTO {
	private Long cargoId;// 화물 ID

	private String description;// 배송설명

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private Timestamp droppedAt;// 하차완료시간

	private CargoTypeDTO cargoType;// 화물타입
	private DeliveryWaypointResponseDTO deliveryWaypoint;// 배송 경유지
}
