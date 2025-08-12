package com.gpt.squirrelLogistics.entity.vehicleType;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "vehicle_type_id")
	private Long vehicleTypeId; //차량 종류 아이디.

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "admin_id", nullable = false)
	private AdminUser adminUser; //관리자 아이디.

	@Column(length = 50)
	private String name; //차량 이름.

	private int maxWeight; //최대 적재량(kg 단위).
	private LocalDateTime regDate; //생성일.
}
