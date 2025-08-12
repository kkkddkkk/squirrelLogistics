package com.gpt.squirrelLogistics.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name="user")
@Getter 
@Setter
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userId;

  @Column(nullable=false, unique=true) 
  private String loginId;
  @Column(nullable=false)               
  private String name;
  @Column(nullable=false, unique=true)  
  private String email;
  private String phone;
  @Column(nullable=false)               
  private String password; // bcrypt
  @Enumerated(EnumType.STRING)          
  private Role role; // DRIVER, COMPANY, ADMIN
  private String account;
  private String businessN;
  private LocalDate birthday;
  private LocalDateTime regDate = LocalDateTime.now();
  private LocalDateTime modiDate;
  private LocalDateTime lastLogin;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  private Driver driver;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
  private Company company;
}
