package com.gpt.squirrelLogistics.service.car;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.car.CarStatusEnum;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final DriverRepository driverRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CarResponseDTO> getCarsByDriverId(Long driverId) {
        log.info("드라이버 차량 조회 - driverId: {}", driverId);
        
        try {
            // 드라이버 ID로 직접 조회 (성능 최적화)
            List<Car> driverCars = carRepository.findByDriverDriverId(driverId);
            log.info("드라이버 차량 수: {}", driverCars.size());
            
            return driverCars.stream()
                    .map(this::convertToCarResponseDTO)
                    .toList();
        } catch (Exception e) {
            log.error("드라이버 차량 조회 중 예외 발생 - driverId: {}", driverId, e);
            throw e;
        }
    }

    @Override
    @Transactional
    public CarResponseDTO createCar(Long driverId, CarRequestDTO request) {
        log.info("차량 추가 시작 - driverId: {}, request: {}", driverId, request);

        try {
            // Driver 조회
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new IllegalArgumentException("운전자를 찾을 수 없습니다. driverId: " + driverId));

            // VehicleType 조회
            VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("차량 타입을 찾을 수 없습니다. vehicleTypeId: " + request.getVehicleTypeId()));

            // Car 엔티티 생성
            Car car = Car.builder()
                    .driver(driver)
                    .vehicleType(vehicleType)
                    .carNum(request.getCarNum())
                    .insurance(request.isInsurance())
                    .Mileage(request.getMileage() != null ? request.getMileage() : 0L)
                    .etc(request.getEtc() != null ? request.getEtc() : "")
                    .inspection(request.getInspection() != null ? request.getInspection() : LocalDateTime.now())
                    .carStatus(request.getCarStatus() != null ? request.getCarStatus() : CarStatusEnum.OPERATIONAL)
                    .regDate(LocalDateTime.now())
                    .build();

            Car savedCar = carRepository.save(car);
            log.info("차량 추가 완료 - carId: {}", savedCar.getCarId());
            
            return convertToCarResponseDTO(savedCar);
        } catch (Exception e) {
            log.error("차량 추가 중 예외 발생 - driverId: {}, request: {}", driverId, request, e);
            throw e;
        }
    }

    @Override
    @Transactional
    public CarResponseDTO updateCar(Long carId, CarRequestDTO request) {
        log.info("차량 수정 시작 - carId: {}, request: {}", carId, request);
        log.info("request.getCarNum(): {}", request.getCarNum());
        log.info("request.getVehicleTypeId(): {}", request.getVehicleTypeId());
        log.info("request.getMileage(): {}", request.getMileage());
        log.info("request.getEtc(): {}", request.getEtc());
        log.info("request.isInsurance(): {}", request.isInsurance());
        log.info("request.getCarStatus(): {}", request.getCarStatus());

        try {
            // carId로 직접 조회
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));
            
            log.info("찾은 차량: {}", car);

            // vehicleTypeId validation
            if (request.getVehicleTypeId() == null) {
                throw new IllegalArgumentException("차량 타입 ID는 필수입니다.");
            }

            // vehicleTypeId로 직접 조회
            VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("차량 타입을 찾을 수 없습니다. vehicleTypeId: " + request.getVehicleTypeId()));
            
            log.info("찾은 차량 타입: {}", vehicleType);

            // 차량 정보 업데이트 (licenseNum은 제외 - Driver 엔티티에서 관리)
            car.setVehicleType(vehicleType);
            // carNum은 수정 불가능한 필드이므로 설정하지 않음
            car.setInsurance(request.isInsurance());
            car.setMileage(request.getMileage() != null ? request.getMileage() : (car.getMileage() != null ? car.getMileage() : 0L));
            car.setEtc(request.getEtc() != null ? request.getEtc() : (car.getEtc() != null ? car.getEtc() : ""));
            car.setInspection(request.getInspection() != null ? request.getInspection() : (car.getInspection() != null ? car.getInspection() : LocalDateTime.now()));
            car.setCarStatus(request.getCarStatus() != null ? request.getCarStatus() : (car.getCarStatus() != null ? car.getCarStatus() : CarStatusEnum.OPERATIONAL));
            car.setModiDate(LocalDateTime.now());
            
            // licenseNum은 Driver 엔티티에서 관리하므로 Car 엔티티에서는 업데이트하지 않음

            log.info("업데이트된 차량 정보: {}", car);

            Car updatedCar = carRepository.save(car);
            log.info("차량 수정 완료 - carId: {}", updatedCar.getCarId());
            
            return convertToCarResponseDTO(updatedCar);
        } catch (Exception e) {
            log.error("차량 수정 중 예외 발생 - carId: {}, request: {}", carId, request, e);
            log.error("요청 데이터 상세: vehicleTypeId={}, mileage={}, etc={}, insurance={}, carStatus={}, inspection={}", 
                request.getVehicleTypeId(), request.getMileage(), request.getEtc(), 
                request.isInsurance(), request.getCarStatus(), request.getInspection());
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteCar(Long carId) {
        log.info("차량 삭제 - carId: {}", carId);

        // carId로 직접 조회
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));

        carRepository.delete(car);
    }

    @Override
    @Transactional
    public List<CarResponseDTO> batchSaveCars(Long driverId, Map<String, Object> request) {
        log.info("차량 일괄 저장 시작 - driverId: {}, request: {}", driverId, request);
        
        try {
            List<CarResponseDTO> results = new ArrayList<>();
            
            // 삭제할 차량들 처리
            @SuppressWarnings("unchecked")
            List<Object> deletedCarIdsObj = (List<Object>) request.get("deletedCarIds");
            if (deletedCarIdsObj != null && !deletedCarIdsObj.isEmpty()) {
                log.info("삭제할 차량 수: {}", deletedCarIdsObj.size());
                for (Object carIdObj : deletedCarIdsObj) {
                    try {
                        Long carId = Long.valueOf(carIdObj.toString());
                        // 해당 차량이 드라이버의 차량인지 확인
                        Car car = carRepository.findById(carId)
                                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));
                        
                        if (!car.getDriver().getDriverId().equals(driverId)) {
                            throw new IllegalArgumentException("해당 차량을 삭제할 권한이 없습니다. carId: " + carId);
                        }
                        
                        deleteCar(carId);
                        log.info("차량 삭제 완료 - carId: {}", carId);
                    } catch (Exception e) {
                        log.error("차량 삭제 실패 - carId: {}", carIdObj, e);
                        throw new IllegalArgumentException("차량 삭제 실패 (carId: " + carIdObj + "): " + e.getMessage());
                    }
                }
            }
            
            // 새로 추가할 차량들 처리
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> newCars = (List<Map<String, Object>>) request.get("newCars");
            if (newCars != null && !newCars.isEmpty()) {
                log.info("추가할 차량 수: {}", newCars.size());
                for (Map<String, Object> carData : newCars) {
                    try {
                        CarRequestDTO carRequestDTO = convertMapToCarRequestDTO(carData);
                        CarResponseDTO result = createCar(driverId, carRequestDTO);
                        results.add(result);
                        log.info("차량 생성 완료 - carId: {}", result.getCarId());
                    } catch (Exception e) {
                        log.error("차량 생성 실패 - carData: {}", carData, e);
                        throw new IllegalArgumentException("차량 생성 실패: " + e.getMessage());
                    }
                }
            }
            
            // 수정할 차량들 처리
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> updatedCars = (List<Map<String, Object>>) request.get("updatedCars");
            if (updatedCars != null && !updatedCars.isEmpty()) {
                log.info("수정할 차량 수: {}", updatedCars.size());
                for (Map<String, Object> carData : updatedCars) {
                    try {
                        Long carId = Long.valueOf(carData.get("carId").toString());
                        // 해당 차량이 드라이버의 차량인지 확인
                        Car car = carRepository.findById(carId)
                                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다. carId: " + carId));
                        
                        if (!car.getDriver().getDriverId().equals(driverId)) {
                            throw new IllegalArgumentException("해당 차량을 수정할 권한이 없습니다. carId: " + carId);
                        }
                        
                        CarRequestDTO carRequestDTO = convertMapToCarRequestDTO(carData);
                        CarResponseDTO result = updateCar(carId, carRequestDTO);
                        results.add(result);
                        log.info("차량 수정 완료 - carId: {}", carId);
                    } catch (Exception e) {
                        log.error("차량 수정 실패 - carData: {}", carData, e);
                        throw new IllegalArgumentException("차량 수정 실패 (carId: " + carData.get("carId") + "): " + e.getMessage());
                    }
                }
            }
            
            log.info("차량 일괄 저장 완료 - 총 처리된 차량 수: {}", results.size());
            return results;
        } catch (Exception e) {
            log.error("차량 일괄 저장 중 예외 발생", e);
            throw e;
        }
    }

    private CarRequestDTO convertMapToCarRequestDTO(Map<String, Object> carData) {
        try {
            log.info("Map을 CarRequestDTO로 변환 - 입력 데이터: {}", carData);
            
            CarRequestDTO result = CarRequestDTO.builder()
                    .vehicleTypeId(Long.valueOf(carData.get("vehicleTypeId").toString()))
                    .carNum(null) // carNum은 수정 불가능한 필드이므로 항상 null로 설정
                    .insurance(Boolean.valueOf(carData.get("insurance").toString()))
                    .Mileage(carData.get("Mileage") != null ? Long.valueOf(carData.get("Mileage").toString()) : null)
                    .etc((String) carData.get("etc"))
                    .inspection(carData.get("inspection") != null ? LocalDateTime.parse(carData.get("inspection").toString()) : null)
                    .carStatus(carData.get("carStatus") != null ? CarStatusEnum.valueOf(carData.get("carStatus").toString()) : null)
                    .build();
            
            log.info("변환된 CarRequestDTO: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Map을 CarRequestDTO로 변환 실패 - 입력 데이터: {}, 오류: {}", carData, e.getMessage(), e);
            throw new IllegalArgumentException("차량 데이터 변환 실패: " + e.getMessage());
        }
    }

    private CarResponseDTO convertToCarResponseDTO(Car car) {
        return CarResponseDTO.builder()
                .carId(car.getCarId())
                .carNum(car.getCarNum())
                .insurance(car.isInsurance())
                .Mileage(car.getMileage())
                .etc(car.getEtc())
                .inspection(car.getInspection())
                .carStatus(car.getCarStatus())
                .regDate(car.getRegDate())
                .modiDate(car.getModiDate())
                .driver(convertToDriverResponseDTO(car.getDriver()))
                .vehicleType(convertToVehicleTypeResponseDTO(car.getVehicleType()))
                .build();
    }

    private DriverResponseDTO convertToDriverResponseDTO(Driver driver) {
        if (driver == null) return null;
        
        return DriverResponseDTO.builder()
                .driverId(driver.getDriverId())
                .mainLoca(driver.getMainLoca())
                .licenseNum(driver.getLicenseNum())
                .drivable(driver.isDrivable())
                .LicenseDT(driver.getLicenseDT() != null ? driver.getLicenseDT().atStartOfDay() : null)
                .profileImageUrl(driver.getProfileImageUrl())
                .build();
    }

    private VehicleTypeResponseDTO convertToVehicleTypeResponseDTO(VehicleType vehicleType) {
        if (vehicleType == null) return null;
        
        return VehicleTypeResponseDTO.builder()
                .vehicleTypeId(vehicleType.getVehicleTypeId())
                .name(vehicleType.getName())
                .maxWeight(vehicleType.getMaxWeight())
                .regDate(vehicleType.getRegDate())
                .build();
    }
} 