package com.gpt.squirrelLogistics.service.car;

import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;

@Service
@RequiredArgsConstructor
@Log4j2
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final DriverRepository driverRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CarResponseDTO> getDriverCars(Long driverId) {
        log.info("기사 차량 목록 조회 - driverId: {}", driverId);

        // 모든 차량을 가져와서 driverId로 필터링
        List<Car> allCars = carRepository.findAll();
        List<Car> driverCars = allCars.stream()
                .filter(car -> car.getDriver() != null && car.getDriver().getDriverId().equals(driverId))
                .collect(Collectors.toList());

        return driverCars.stream()
                .map(this::convertToCarResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CarResponseDTO getCarById(Long carId) {
        log.info("차량 상세 조회 - carId: {}", carId);

        // 모든 차량을 가져와서 carId로 필터링
        List<Car> allCars = carRepository.findAll();
        Car car = allCars.stream()
                .filter(c -> c.getCarId().equals(carId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다."));

        return convertToCarResponseDTO(car);
    }

    @Override
    @Transactional
    public CarResponseDTO createCar(Long driverId, CarRequestDTO request) {
        log.info("차량 추가 - driverId: {}, request: {}", driverId, request);

        // 모든 Driver를 가져와서 driverId로 필터링
        List<Driver> allDrivers = driverRepository.findAll();
        Driver driver = allDrivers.stream()
                .filter(d -> d.getDriverId().equals(driverId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));

        // 모든 VehicleType을 가져와서 vehicleTypeId로 필터링
        List<VehicleType> allVehicleTypes = vehicleTypeRepository.findAll();
        VehicleType vehicleType = allVehicleTypes.stream()
                .filter(vt -> vt.getVehicleTypeId().equals(request.getVehicleTypeId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("차량 타입을 찾을 수 없습니다."));

        Car car = Car.builder()
                .driver(driver)
                .vehicleType(vehicleType)
                .carNum(request.getCarNum())
                .insurance(request.isInsurance())
                .Mileage(request.getMileage())
                .etc(request.getEtc())
                .inspection(request.getInspection())
                .carStatus(request.getCarStatus())
                .regDate(LocalDateTime.now())
                .build();

        Car savedCar = carRepository.save(car);
        return convertToCarResponseDTO(savedCar);
    }

    @Override
    @Transactional
    public CarResponseDTO updateCar(Long carId, CarRequestDTO request) {
        log.info("차량 수정 - carId: {}, request: {}", carId, request);

        // 모든 차량을 가져와서 carId로 필터링
        List<Car> allCars = carRepository.findAll();
        Car car = allCars.stream()
                .filter(c -> c.getCarId().equals(carId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다."));

        // 모든 VehicleType을 가져와서 vehicleTypeId로 필터링
        List<VehicleType> allVehicleTypes = vehicleTypeRepository.findAll();
        VehicleType vehicleType = allVehicleTypes.stream()
                .filter(vt -> vt.getVehicleTypeId().equals(request.getVehicleTypeId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("차량 타입을 찾을 수 없습니다."));

        car.setVehicleType(vehicleType);
        car.setCarNum(request.getCarNum());
        car.setInsurance(request.isInsurance());
        car.setMileage(request.getMileage());
        car.setEtc(request.getEtc());
        car.setInspection(request.getInspection());
        car.setCarStatus(request.getCarStatus());
        car.setModiDate(LocalDateTime.now());

        Car updatedCar = carRepository.save(car);
        return convertToCarResponseDTO(updatedCar);
    }

    @Override
    @Transactional
    public void deleteCar(Long carId) {
        log.info("차량 삭제 - carId: {}", carId);

        // 모든 차량을 가져와서 carId로 필터링
        List<Car> allCars = carRepository.findAll();
        Car car = allCars.stream()
                .filter(c -> c.getCarId().equals(carId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("차량을 찾을 수 없습니다."));

        carRepository.delete(car);
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