package com.gpt.squirrelLogistics.entity.term;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "term")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Term {//약관동의
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "term_id")
	private Long termId;//약관 ID
	
	private String termName;//약관
	private String termContent;//약관내용
	private boolean isRequired;//약관 필수 여부
	
	private LocalDateTime createDT;//생성일
	private LocalDateTime updateDT;//수정일
	
}
