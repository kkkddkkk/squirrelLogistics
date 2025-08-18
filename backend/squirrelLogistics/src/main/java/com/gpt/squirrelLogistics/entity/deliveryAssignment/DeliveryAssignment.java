package com.gpt.squirrelLogistics.entity.deliveryAssignment;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
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
@Table(name = "delivery_assignment")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryAssignment {//운송 기록
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="delivery_assignment_id")
	private Long assignedId;// 요청 ID
	
	private LocalDateTime assignedAt;//수락 일시
	private LocalDateTime completedAt;//종료 일시
	private LocalDateTime cancelledAt;//취소일시
	
	@Enumerated(EnumType.STRING)
	private StatusEnum status;//수락 상태
	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
	private DeliveryRequest deliveryRequest;//배송 요청
	
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
	private Payment payment;//결제
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "driver_id")
	private Driver driver;//운전자
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "actualDelivery_id")
	private ActualDelivery actualDelivery;//실제 운송
}
