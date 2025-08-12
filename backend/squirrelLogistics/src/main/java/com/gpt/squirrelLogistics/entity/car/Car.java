package com.gpt.squirrelLogistics.entity.car;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.car.CarStatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "car")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Car {//등록차량
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "car_id")
	private Long carId;//등록차량 ID
	
	private boolean insurance;//차량 보험 여부
	private String carNum;//차량 번호
	private Long Mileage;//총 주행거리
	private String etc;//기타사항
	
	private LocalDateTime inspection;//차량점검일
	private LocalDateTime regDate;//등록일
	private LocalDateTime modiDate;//정보수정일
	
	@Enumerated(EnumType.STRING)
	private CarStatusEnum carStatus;//차량상태
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "driver_id")
	private Driver driver;//운전자 세부정보
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "vehicle_type_id")
	private VehicleType vehicleType;//차량 종류
}
