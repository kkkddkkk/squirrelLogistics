package com.gpt.squirrelLogistics.entity.deliverySchedule;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "delivery_schedule")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliverySchedule {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "schedule_id")
	private Long scheduleId; //일정 아이디.

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "delivery_assignment_id")
	private DeliveryAssignment deliveryAssignment; //할당 아이디.

	private LocalDateTime scheduleDate; //운송 날짜.
	private LocalDateTime startTime; //시작 시간.
	private LocalDateTime endTime; //완료 시간.

}
