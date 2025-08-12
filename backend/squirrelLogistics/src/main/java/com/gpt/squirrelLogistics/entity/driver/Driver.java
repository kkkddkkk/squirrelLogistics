package com.gpt.squirrelLogistics.entity.driver;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.user.User;

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
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "driver")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Driver {//운전자 세부정보
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "driver_id")
	private Long driverId;//운전자 ID
	
	private String mainLoca;//선호지역
	private String licenseNum;//운전면허번호
	private LocalDateTime LicenseDT;//면허 유효기간
	private boolean drivable;//운전 가능 여부
	
	private LocalDateTime preferredStartTime; //선호 시간대
	private LocalDateTime preferredEndTime;//선호 시간대
	private String profileImageName;//프사 이미지 저장명
	private String profileImagePath;//프사 이미지 경로
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;//회원
}
