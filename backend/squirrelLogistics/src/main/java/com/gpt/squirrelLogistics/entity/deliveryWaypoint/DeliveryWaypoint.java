package com.gpt.squirrelLogistics.entity.deliveryWaypoint;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.enums.deliveryWaypoint.StatusEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "delivery_waypoint")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryWaypoint {// 배송 경유지
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "waypoint_id")
	private Long waypointId;// 경유지 ID

	private String address;// 주소
	private int dropOrder;// 배송순서

	private LocalDateTime arriveAt;// 도착시간
	private LocalDateTime droppedAt;// 배송시간

	@Enumerated(EnumType.STRING)
	private StatusEnum status;// 경유지 상태

	@ManyToOne
	@JoinColumn(name = "request_id")
	private DeliveryRequest deliveryRequest;// 배송 요청


	public void updateAddress(String address) {
		this.address = address;
	}
	
	public void updateDropOrder(int dropOrder) {
		this.dropOrder = dropOrder;
	}
	
	public void updateStatus(StatusEnum status) {
		this.status = status;
	}
	
	public void updateArriveAt(LocalDateTime arriveAt) {
		this.arriveAt = arriveAt;
	}
	
	public void updateDroppedAt(LocalDateTime droppedAt) {
		this.droppedAt = droppedAt;
	}
}
