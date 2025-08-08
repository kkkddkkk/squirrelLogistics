package com.gpt.squirrelLogistics.repository.car;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.car.Car;

public interface CarRepository extends JpaRepository<Car, Long> {

}
