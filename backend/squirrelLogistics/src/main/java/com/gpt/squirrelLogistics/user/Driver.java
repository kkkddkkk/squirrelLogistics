package com.gpt.squirrelLogistics.user;

import java.time.LocalDate;

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
@Table(name="driver")
@Getter 
@Setter
public class Driver {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long driverId;

  @OneToOne @JoinColumn(name="user_id", nullable=false)
  private User user;

  private String mainLoca;
  private String licenseNum;
  private LocalDate licenseDT;
  private Boolean drivable;
}