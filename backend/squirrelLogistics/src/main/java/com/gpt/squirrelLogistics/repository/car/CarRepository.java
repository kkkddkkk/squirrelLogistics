package com.gpt.squirrelLogistics.repository.car;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.car.Car;

public interface CarRepository extends JpaRepository<Car, Long> {

    //작성자: 고은설.
    //기능: 드라이버 아이디의 운전자가 차량종류 아이디의 자차 소지 여부 검사.
    boolean existsByDriverDriverIdAndVehicleTypeVehicleTypeId(Long driverId, Long vehicleTypeId);
}
