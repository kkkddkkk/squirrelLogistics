package com.gpt.squirrelLogistics.entity.deliveryCargo;


import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.cargoType.CargoType;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "delivery_cargo")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryCargo {//하차화물
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="cargo_id")
	private Long cargoId;// 화물 ID

	private String description;// 배송설명
	private LocalDateTime droppedAt;// 하차완료시간
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "handling_id")
	private CargoType cargoType;//화물종류
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "waypoint_id")
	private DeliveryWaypoint deliveryWaypoint;//배송 경유지
}
