package com.gpt.squirrelLogistics.user;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name="company")
@Getter 
@Setter
public class Company {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long companyId;

  @OneToOne @JoinColumn(name="user_id", nullable=false)
  private User user;

  private String address;
}