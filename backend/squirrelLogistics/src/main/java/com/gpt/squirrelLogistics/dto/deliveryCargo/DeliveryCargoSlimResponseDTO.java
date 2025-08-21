package com.gpt.squirrelLogistics.dto.deliveryCargo;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DeliveryCargoSlimResponseDTO {

	private final Long cargoId;
	private final Long waypointId;
	private final Long handlingId; 
	private final String handlingTags;
	private final String description;
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private final LocalDateTime droppedAt;
}
