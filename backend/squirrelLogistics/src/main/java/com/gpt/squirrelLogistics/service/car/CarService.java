package com.gpt.squirrelLogistics.service.car;

import java.util.List;
import java.util.Map;

import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;

public interface CarService {
    
    /**
     * 드라이버의 차량 목록 조회
     */
    List<CarResponseDTO> getCarsByDriverId(Long driverId);
    
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
    
    /**
     * 차량 일괄 저장 (추가, 수정, 삭제)
     */
    List<CarResponseDTO> batchSaveCars(Long driverId, Map<String, Object> request);
} 