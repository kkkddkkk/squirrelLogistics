package com.gpt.squirrelLogistics.dto.deliveryCargo;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.entity.cargoType.CargoType;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryCargoRequestDTO {
	private Long cargoId;// 화물 ID

	private String description;// 배송설명

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime droppedAt;// 하차완료시간

	private Long handlingId;//화물타입
	private Long waypointId;//배송 경유지
}
