package com.gpt.squirrelLogistics.entity.actualDelivery;

import com.gpt.squirrelLogistics.entity.cargoType.CargoType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "actual_delivery")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActualDelivery {//실제운송
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "actual_delivery_id")
	private Long actualDeliveryId;//실제운송 ID
	
	private Long distance;//총 거리
	private Long weight;//총 무게
	private boolean mountainous;//산간지역 여부
	private boolean caution;//취급주의 여부
	private Long actualFee;//총 금액
}
