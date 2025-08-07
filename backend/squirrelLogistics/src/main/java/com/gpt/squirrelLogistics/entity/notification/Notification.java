package com.gpt.squirrelLogistics.entity.notification;

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
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "noti_id")
	private Long notiId; //공지 아이디.
  
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = false) 
    private AdminUser adminUser; //관리자 아이디.
 
    @Column(length = 50)
	private String title; //제목.
    
    @Column(length = 300)
	private String content; //내용.
    
    @Column(length = 30)
	private String type; //타입.
    
	private LocalDateTime regDate; //생성일.
}
