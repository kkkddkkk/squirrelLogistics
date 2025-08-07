package com.gpt.squirrelLogistics.entity.promotion;

import java.time.LocalDateTime;

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
@Table(name = "promotion")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Promotion {//프로모션
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "promo_id")
	private Long promoId;//프로모션 ID
	
	private String promo;//할인종류
	private Long discount;//할인율
	
	private LocalDateTime startDT;//시작일
	private LocalDateTime endDate;//종료일
}
