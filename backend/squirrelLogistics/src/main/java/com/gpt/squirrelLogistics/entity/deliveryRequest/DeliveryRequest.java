package com.gpt.squirrelLogistics.entity.deliveryRequest;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "delivery_request")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryRequest {//배송요청
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="request_id")
	private Long requestId;// 요청 ID
	
	private String startAddress;//출발지 위치
	private String endAddress;//도착지 위치
	private String memoToDriver;//배송 요청 메모
	private int totalCargoCount;//총 화물 수
	private int totalCargoWeight;//총 화물 무게
	private Long estimatedFee;//예상금액
	private Long distance;//거리
	
	private LocalDateTime createAt;//요청 등록 시간
	private LocalDateTime wantToStart;//희망 시작일
	private LocalDateTime wantToEnd;//희망 종료일
	
	@Lob
	@Column(columnDefinition = "TEXT")
	private String expectedPolyline;
	
	@Lob
	@Column(columnDefinition = "TEXT")
	private String expectedRoute;
	
	
	@Enumerated(EnumType.STRING)
	private StatusEnum status;//요청 상태
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payment_id")
	private Payment payment;
	
	//물류회사(Company)
	//차량종류(vehicleType)
	
}
