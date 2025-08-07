package com.gpt.squirrelLogistics.entity.deliveryStatusLog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum;

//import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "delivery_tracking_log")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryStatusLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "status_id")
	private Long statusId; //추적 로그 아이디.

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "delivery_assignment_id")
	private DeliveryAssignment deliveryAssignment; //할당 아이디.

	@Enumerated(EnumType.STRING)
	private DeliveryStatusEnum status; //배송 상태.
	
	private int lastVisitedWaypoint; //마지막 완료 경유지.
	private LocalDateTime createdAt; //기록 시간.
}
