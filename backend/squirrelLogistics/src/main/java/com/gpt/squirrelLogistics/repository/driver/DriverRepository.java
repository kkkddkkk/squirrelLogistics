package com.gpt.squirrelLogistics.repository.driver;

import java.util.List;

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
	 * 즉시 배차 가능한 기사 수 조회 기사 통계 정보 조회에 사용
	 */
	@Query("SELECT COUNT(d) FROM Driver d WHERE d.drivable = true")
	long countByDrivableTrue();

	@Query("SELECT d.driverId FROM Driver d " + "JOIN d.user u WHERE u.userId =:userId")
	Long findDriverIdByUserId(@Param("userId") Long userId);
	
	//작성자: 김도경
	@Query("SELECT d.profileImageUrl FROM Driver d WHERE d.driverId =:driverId")
	String findProfileById(@Param("driverId") Long driverId);

	/**
	 * 기사 리스트 조회 (프로필/차량/보험 포함) - Driver → Car(ON) → VehicleType 반환 배열: [0:
	 * driverId, 1: driverName, 2: profileImageUrl, 3: vehicleTypeName, 4:
	 * maxWeight, 5: mainLoca, 6: drivable, 7: insurance]
	 */
	//김도경 수정: 상태가 OPERATIONAL인 차량만 가져오도록 조건 추가, drivable한 운전자만 가져오도록 추가
	@Query("""
			SELECT
			    d.driverId,
			    u.name,
			    COALESCE(d.profileImageUrl, ''),
			    v.name,
			    v.maxWeight,
			    d.mainLoca,
			    d.drivable,
			    c.insurance
			FROM Driver d
			JOIN d.user u
			JOIN Car c ON c.driver = d
			JOIN c.vehicleType v
			WHERE u.role != 'ETC'
			AND c.carStatus ='OPERATIONAL'
			AND d.drivable = true
			""")
	List<Object[]> findDriverList();
	
	//driverId로 userName 조회
	//작성자: 김도경
	@Query("SELECT d.user.name FROM Driver d WHERE d.driverId =:driverId")
	String findUserNameByDriverId(@Param("driverId") Long driverId);
	
	//companyId로 userName 조회
	//작성자: 김도경
	@Query("SELECT d.user.Pnumber FROM Driver d WHERE d.driverId =:driverId")
	String findUserNumByDriverId(@Param("driverId") Long driverId);
	
}
