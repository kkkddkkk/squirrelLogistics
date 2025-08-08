package com.gpt.squirrelLogistics.dto.deliveryCargo;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryCargoSlimResponseDTO {
	private Long cargoId;// 화물 ID

	private String description;// 배송설명
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private Timestamp droppedAt;// 하차완료시간

	private Long cargoTypeId;//화물타입 ID
	private Long deliveryWaypointID;//배송 경유지 ID
}
