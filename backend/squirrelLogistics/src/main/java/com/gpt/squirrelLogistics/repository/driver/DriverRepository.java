package com.gpt.squirrelLogistics.repository.driver;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.driver.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    
    /**
     * userId로 Driver 조회
     */
    @Query("SELECT d FROM Driver d WHERE d.user.userId = :userId")
    Driver findByUserId(@Param("userId") Long userId);
    
    /**
     * 즉시 배차 가능한 기사 수 조회
     * 기사 통계 정보 조회에 사용
     */
    @Query("SELECT COUNT(d) FROM Driver d WHERE d.drivable = true")
    long countByDrivableTrue();
}
