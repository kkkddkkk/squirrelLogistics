package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.repository.car.CarRepository;

import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CarResponseDTO> getDriverCars(Long userId) {
        log.info("기사 차량 조회 시작 - userId: {}", userId);
        
        // 모든 차량을 가져와서 userId로 필터링
        List<Car> cars = carRepository.findAll().stream()
                .filter(car -> car.getDriver().getUser().getUserId().equals(userId))
                .toList();
        
        return cars.stream()
                .map(car -> CarResponseDTO.builder()
                        .carId(car.getCarId())
                        .insurance(car.isInsurance())
                        .carNum(car.getCarNum())
                        .Mileage(car.getMileage())
                        .etc(car.getEtc())
                        .inspection(car.getInspection())
                        .regDate(car.getRegDate())
                        .modiDate(car.getModiDate())
                        .carStatus(car.getCarStatus())
                        .driver(null) // 필요시 DriverResponseDTO로 변환
                        .vehicleType(null) // 필요시 VehicleTypeResponseDTO로 변환
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public CarResponseDTO addCar(Long userId, CarRequestDTO carRequest) {
        log.info("차량 추가 시작 - userId: {}, carNum: {}", userId, carRequest.getCarNum());
        
        // 기존 차량에서 Driver 정보 가져오기
        Driver driver = carRepository.findAll().stream()
                .filter(car -> car.getDriver().getUser().getUserId().equals(userId))
                .findFirst()
                .map(Car::getDriver)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. userId: " + userId));
        
        VehicleType vehicleType = null;
        if (carRequest.getVehicleTypeId() != null) {
            vehicleType = vehicleTypeRepository.findById(carRequest.getVehicleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("차량 종류를 찾을 수 없습니다. vehicleTypeId: " + carRequest.getVehicleTypeId()));
        }
        
        Car car = Car.builder()
                .driver(driver)
                .insurance(carRequest.isInsurance())
                .carNum(carRequest.getCarNum())
                .Mileage(carRequest.getMileage())
                .etc(carRequest.getEtc())
                .inspection(carRequest.getInspection())
                .regDate(LocalDateTime.now())
                .modiDate(LocalDateTime.now())
                .carStatus(carRequest.getCarStatus())
                .vehicleType(vehicleType)
                .build();
        
        Car savedCar = carRepository.save(car);
        
        return CarResponseDTO.builder()
                .carId(savedCar.getCarId())
                .insurance(savedCar.isInsurance())
                .carNum(savedCar.getCarNum())
                .Mileage(savedCar.getMileage())
                .etc(savedCar.getEtc())
                .inspection(savedCar.getInspection())
                .regDate(savedCar.getRegDate())
                .modiDate(savedCar.getModiDate())
                .carStatus(savedCar.getCarStatus())
                .driver(null) // 필요시 DriverResponseDTO로 변환
                .vehicleType(null) // 필요시 VehicleTypeResponseDTO로 변환
                .build();
    }

    @Override
    @Transactional
    public CarResponseDTO updateCar(Long userId, Long carId, CarRequestDTO carRequest) {
        log.info("차량 수정 시작 - userId: {}, carId: {}", userId, carId);
        
        // 기존 차량에서 Driver 정보 가져오기
        Driver driver = carRepository.findAll().stream()
                .filter(car -> car.getDriver().getUser().getUserId().equals(userId))
                .findFirst()
                .map(Car::getDriver)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. userId: " + userId));
        
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));
        
        // 차량이 해당 기사에게 속하는지 확인
        if (!car.getDriver().getDriverId().equals(driver.getDriverId())) {
            throw new IllegalArgumentException("해당 차량에 대한 수정 권한이 없습니다.");
        }
        
        VehicleType vehicleType = null;
        if (carRequest.getVehicleTypeId() != null) {
            vehicleType = vehicleTypeRepository.findById(carRequest.getVehicleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("차량 종류를 찾을 수 없습니다. vehicleTypeId: " + carRequest.getVehicleTypeId()));
        }
        
        car.setInsurance(carRequest.isInsurance());
        car.setCarNum(carRequest.getCarNum());
        car.setMileage(carRequest.getMileage());
        car.setEtc(carRequest.getEtc());
        car.setInspection(carRequest.getInspection());
        car.setModiDate(LocalDateTime.now());
        car.setCarStatus(carRequest.getCarStatus());
        car.setVehicleType(vehicleType);
        
        Car updatedCar = carRepository.save(car);
        
        return CarResponseDTO.builder()
                .carId(updatedCar.getCarId())
                .insurance(updatedCar.isInsurance())
                .carNum(updatedCar.getCarNum())
                .Mileage(updatedCar.getMileage())
                .etc(updatedCar.getEtc())
                .inspection(updatedCar.getInspection())
                .regDate(updatedCar.getRegDate())
                .modiDate(updatedCar.getModiDate())
                .carStatus(updatedCar.getCarStatus())
                .driver(null) // 필요시 DriverResponseDTO로 변환
                .vehicleType(null) // 필요시 VehicleTypeResponseDTO로 변환
                .build();
    }

    @Override
    @Transactional
    public void deleteCar(Long userId, Long carId) {
        log.info("차량 삭제 시작 - userId: {}, carId: {}", userId, carId);
        
        // 기존 차량에서 Driver 정보 가져오기
        Driver driver = carRepository.findAll().stream()
                .filter(car -> car.getDriver().getUser().getUserId().equals(userId))
                .findFirst()
                .map(Car::getDriver)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. userId: " + userId));
        
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));
        
        // 차량이 해당 기사에게 속하는지 확인
        if (!car.getDriver().getDriverId().equals(driver.getDriverId())) {
            throw new IllegalArgumentException("해당 차량에 대한 삭제 권한이 없습니다.");
        }
        
        carRepository.delete(car);
        log.info("차량 삭제 완료 - carId: {}", carId);
    }
} 