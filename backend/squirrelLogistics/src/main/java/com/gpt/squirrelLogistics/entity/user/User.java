package com.gpt.squirrelLogistics.entity.user;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "user")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {// 회원

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long userId;// 회원 ID

	private String loginId;// 로그인 ID
	private String name;// 이름
	private String email;// 이메일
	private String Pnumber;// 전화번호
	private String password;// 비밀번호
	private String account;// 계좌번호
	private String businessN;// 사업자등록번호
	private LocalDateTime birthday;// 생년월일
	private LocalDateTime regDate;// 가입일자
	private LocalDateTime modiDate;// 수정일
	private LocalDateTime lastLogin;// 마지막 로그인

	@Enumerated(EnumType.STRING)
	private UserRoleEnum role;// 권한

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	private Driver driver;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	private Company company;
}
