package com.gpt.squirrelLogistics.service.car;

import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import java.util.List;

public interface CarService {

    /**
     * 기사의 차량 목록 조회
     */
    List<CarResponseDTO> getDriverCars(Long driverId);

    /**
     * 차량 상세 조회
     */
    CarResponseDTO getCarById(Long carId);

    /**
     * 차량 추가
     */
    CarResponseDTO createCar(Long driverId, CarRequestDTO request);

    /**
     * 차량 수정
     */
    CarResponseDTO updateCar(Long carId, CarRequestDTO request);

    /**
     * 차량 삭제
     */
    void deleteCar(Long carId);
} 