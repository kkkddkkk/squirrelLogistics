package com.gpt.squirrelLogistics.repository.car;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.car.Car;

public interface CarRepository extends JpaRepository<Car, Long> {

	// 작성자: 고은설.
	// 기능: 드라이버 아이디의 운전자가 차량종류 아이디의 자차 소지 여부 검사.
	boolean existsByDriverDriverIdAndVehicleTypeVehicleTypeId(Long driverId, Long vehicleTypeId);

	// 기사 검색을 위한 메서드 추가
	// 드라이버 ID로 차량 조회
	List<Car> findByDriverDriverId(Long driverId);

	// 작성자: 고은설.
	// 기능: 차량 종류 + 운전 가능 여부까지 확인.
//	@Query("""
//			  select count(c) > 0
//			  from Car c
//			  where c.driver.driverId = :driverId
//			    and c.vehicleType.vehicleTypeId = :vehicleTypeId
//			    and c.carStatus = com.gpt.squirrelLogistics.enums.CarStatus.OPERATIONAL
//			    and c.insurance = true
//			    and c.inspection >= :inspectionThreshold
//			""")
//	boolean hasEligibleCar(Long driverId, Long vehicleTypeId, LocalDateTime inspectionThreshold);

	@Query("""
			    select count(c) > 0
			    from Car c
			    where c.driver.driverId = :driverId
			      and c.vehicleType.vehicleTypeId = :vehicleTypeId
			      and c.carStatus = com.gpt.squirrelLogistics.enums.car.CarStatusEnum.OPERATIONAL
			""")
	boolean hasEligibleCar(@Param("driverId") Long driverId, @Param("vehicleTypeId") Long vehicleTypeId);

}
