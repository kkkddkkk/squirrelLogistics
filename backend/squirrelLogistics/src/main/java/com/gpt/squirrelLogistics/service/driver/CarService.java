package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;

import java.util.List;

public interface CarService {
    
    /**
     * 기사의 모든 차량 조회
     */
    List<CarResponseDTO> getDriverCars(Long userId);
    
    /**
     * 차량 추가
     */
    CarResponseDTO addCar(Long userId, CarRequestDTO carRequest);
    
    /**
     * 차량 수정
     */
    CarResponseDTO updateCar(Long userId, Long carId, CarRequestDTO carRequest);
    
    /**
     * 차량 삭제
     */
    void deleteCar(Long userId, Long carId);
} 