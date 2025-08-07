package com.gpt.squirrelLogistics.entity.deliveryTrackingLog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

//import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

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
@Table(name = "delivery_tracking_log")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryTrackingLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "tracking_id")
	private Long trackingId; //추적 로그 아이디.

//	@ManyToOne(fetch = FetchType.LAZY)
//	@JoinColumn(name = "assigned_id")
//	private DeliveryAssignment deliveryAssignment; //할당 아이디.

	private BigDecimal lat; //위도.
	private BigDecimal lng; //경도.
	private LocalDateTime createdAt; //기록 시간.
}
