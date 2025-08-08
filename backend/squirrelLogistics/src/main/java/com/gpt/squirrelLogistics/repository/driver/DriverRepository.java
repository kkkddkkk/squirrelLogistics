package com.gpt.squirrelLogistics.repository.driver;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.driver.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

}
