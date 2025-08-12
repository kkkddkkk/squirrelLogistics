package com.gpt.squirrelLogistics.user;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicle_type")
@Getter
@Setter
public class VehicleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_type_id")
    private Long id;

    @Column(name = "max_weight")
    private String maxWeight;

    @Column(nullable = false)
    private String name;

    @Column(name = "reg_date")
    private LocalDate regDate = LocalDate.now();

    public VehicleType() { }

    public VehicleType(String maxWeight, String name) {
        this.maxWeight = maxWeight;
        this.name = name;
        this.regDate = LocalDate.now();
    }
}