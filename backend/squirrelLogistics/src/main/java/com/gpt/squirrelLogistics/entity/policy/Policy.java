package com.gpt.squirrelLogistics.entity.policy;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.enums.policy.PolicyTypeEnum;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "policy")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "policy_id")
	private Long policyId; //정책 아이디.
  
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = true) 
    private AdminUser adminUser; //관리자 아이디.
 
    @Enumerated(EnumType.STRING)
	private PolicyTypeEnum type; //정책 종류.
    
    @Column(length = 100)
	private String title; //제목.
    
    @Column(length = 2000)
	private String content; //내용.
    
    private LocalDateTime regDate; //생성일.
	private LocalDateTime modiDate; //수정일.
}
