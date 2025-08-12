package com.gpt.squirrelLogistics.entity.cargoType;

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
@Table(name = "cargo_type")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CargoType {//화물종류
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "handling_id")
	private Long handlingId;//취급유형 ID
	
	private String handlingTags;//취급유형
	private Long extraFee;//추가금
}
