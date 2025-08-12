package com.gpt.squirrelLogistics.entity.answer;

import java.time.LocalDateTime;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.report.Report;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "answer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {//답변
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "answer_id")
	private Long answerId; //답변 아이디.
  
	private LocalDateTime regDate; //생성일.
	private LocalDateTime modiDate; //수정일.
	private String content;//답변 내용
	
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = false) 
    private AdminUser adminUser; //관리자 아이디.
	
	@OneToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "report_id", nullable = false) 
	private Report report;//신고
}
