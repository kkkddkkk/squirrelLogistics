package com.gpt.squirrelLogistics.entity.review;


import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.enums.review.StateEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "review")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Review {//리뷰
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "review_id")
	private Long reviewId;//리뷰 ID
	
	private int rating;//평점
	private String reason;//사유
	private LocalDateTime regDate;//등록일
	private LocalDateTime modiDate;//수정일
	
	@Enumerated(EnumType.STRING)
	private StateEnum stateEnum;//등록 상태
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_id")
	private DeliveryAssignment deliveryAssignment;//운송 기록
}
