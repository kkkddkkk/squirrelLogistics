package com.gpt.squirrelLogistics.entity.faq;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;

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
@Table(name = "faq")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "faq_id")
	private Long faqId; //자주 묻는 질문 아이디.
  
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = false) 
    private AdminUser adminUser; //관리자 아이디.
 
    @Column(length = 100)
	private String question; //질문.
    
    @Column(length = 100)
	private String answer; //답변.
    
    @Enumerated(EnumType.STRING)
    private FaqCategoryEnum category; //카테고리.
    
	private LocalDateTime regDate; //생성일.

	private LocalDateTime modiDate; //수정일.
}
