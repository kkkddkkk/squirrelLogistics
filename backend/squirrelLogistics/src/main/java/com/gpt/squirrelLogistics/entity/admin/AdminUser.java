package com.gpt.squirrelLogistics.entity.admin;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "admin_id")
	private Long adminId; //관리자 아이디.

    @Column(length = 100)
	private String email; //이메일.
    
    @Column(length = 100)
	private String password; //비밀번호.
    
    @Column(length = 15)
	private String name; //이름.
    
    @Column(length = 100)
	private String role; //권한.
    
	private LocalDateTime lastLogin; //마지막 로그인 날짜.
	private LocalDateTime regDate; //생성일.
	private LocalDateTime modiDate; //수정일.

}
