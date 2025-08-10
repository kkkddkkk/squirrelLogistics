package com.gpt.squirrelLogistics.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.user.Car;

public interface CarRepository extends JpaRepository<Car, Long> {}