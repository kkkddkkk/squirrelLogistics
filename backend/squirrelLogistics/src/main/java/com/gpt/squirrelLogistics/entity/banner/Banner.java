package com.gpt.squirrelLogistics.entity.banner;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banner")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "banner_id")
	private Long bannerId; //배너 아이디.
  
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = false) 
    private AdminUser adminUser; //관리자 아이디.
 
    @Column(length = 50)
	private String title; //제목.
    
    @Column(length = 500)
	private String imageUrl; //이미지 경로.
    
	private boolean isActive; //노출 여부.
    
	private LocalDateTime regDate; //생성일.
	
	private LocalDateTime modiDate; //수정일.

}
