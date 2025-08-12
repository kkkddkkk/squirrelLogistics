package com.gpt.squirrelLogistics.user;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name="car")
@Getter 
@Setter
public class Car {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne @JoinColumn(name="vehicle_type_id", nullable=false)
  private VehicleType vehicleType;

  @ManyToOne @JoinColumn(name="driver_id", nullable=false)
  private Driver driver;

  @Column(unique=true) private String carNum;
  private LocalDate regDate;
  private LocalDate modDate;
}