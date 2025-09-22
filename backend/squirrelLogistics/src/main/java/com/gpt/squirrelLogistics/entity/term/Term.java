package com.gpt.squirrelLogistics.entity.term;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.entity.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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
public class Term {// 약관동의

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "term_id")
	private Long termId;// 약관 ID

	private String termName;// 약관
	@Column(name = "term_content", columnDefinition = "MEDIUMTEXT")
	private String termContent;// 약관내용
	private boolean isRequired;// 약관 필수 여부

	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createDT;// 생성일
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime updateDT;// 수정일

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id") // NULL 허용 (DB도 NULL)
	private User user;

	// --- 편의 메서드 ---
	public void update(String termName, String termContent, boolean isRequired, User user) {
		this.termName = termName;
		this.termContent = termContent;
		this.isRequired = isRequired;
		this.user = user;
		this.updateDT = LocalDateTime.now();
	}

	@PrePersist
	protected void onCreate() {
		LocalDateTime now = LocalDateTime.now();
		this.createDT = now;
		this.updateDT = now;
	}

	@PreUpdate
	protected void onUpdate() {
		this.updateDT = LocalDateTime.now();
	}

}
