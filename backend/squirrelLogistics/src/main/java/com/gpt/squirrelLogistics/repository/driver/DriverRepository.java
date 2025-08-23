package com.gpt.squirrelLogistics.repository.driver;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.driver.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    
    // userId로 Driver 조회
    @Query("SELECT d FROM Driver d WHERE d.user.userId = :userId")
Driver findByUserId(@Param("userId") Long userId);


}
