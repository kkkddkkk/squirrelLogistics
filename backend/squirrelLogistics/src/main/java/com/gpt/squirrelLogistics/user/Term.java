package com.gpt.squirrelLogistics.user;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name="term")
@Getter 
@Setter
public class Term {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String termName;
  @ManyToOne @JoinColumn(name="user_id", nullable=false)
  private User user;

  @Lob private String termContent;
  private LocalDate createDT;
  private LocalDate updateDT;
  private Boolean isRequired;
}