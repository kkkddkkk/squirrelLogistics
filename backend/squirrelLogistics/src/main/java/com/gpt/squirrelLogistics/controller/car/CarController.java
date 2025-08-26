package com.gpt.squirrelLogistics.controller.car;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.service.car.CarService;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.entity.driver.Driver;

import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@Log4j2
public class CarController {

    private final CarService carService;
    private final JwtTokenProvider jwtTokenProvider;
    private final DriverRepository driverRepository;

    // JWT 토큰에서 userId 추출하는 공통 메서드
    private Long extractUserIdFromToken(String authHeader) {
        log.info("extractUserIdFromToken 호출됨, authHeader: {}", authHeader);
        
        try {
            // test-token 처리
            if (authHeader != null && authHeader.contains("test-token")) {
                log.info("test-token 감지됨, userId = 11 반환");
                return 11L; // test-token일 경우 userId = 11 반환
            }
            
            String token = authHeader.replace("Bearer ", "");
            Jws<Claims> claims = jwtTokenProvider.parse(token);
            Object uidObj = claims.getBody().get("uid");
            
            log.info("JWT에서 추출된 uid 원본: {} (타입: {})", uidObj, uidObj != null ? uidObj.getClass().getSimpleName() : "null");
            
            if (uidObj instanceof Integer) {
                return ((Integer) uidObj).longValue();
            } else if (uidObj instanceof Long) {
                return (Long) uidObj;
            } else if (uidObj instanceof Double) {
                return ((Double) uidObj).longValue();
            } else {
                log.error("예상치 못한 uid 타입: {}", uidObj != null ? uidObj.getClass().getSimpleName() : "null");
                throw new RuntimeException("Invalid uid type in JWT token");
            }
        } catch (Exception e) {
            log.error("JWT 토큰 파싱 실패: {}", e.getMessage());
            throw new RuntimeException("Failed to parse JWT token", e);
        }
    }

    // userId로 driverId 조회하는 메서드
    private Long getDriverIdByUserId(Long userId) {
        Driver driver = driverRepository.findByUserId(userId);
        if (driver == null) {
            throw new IllegalArgumentException("해당 사용자의 Driver 정보를 찾을 수 없습니다. userId: " + userId);
        }
        return driver.getDriverId();
    }

    /**
     * 작성자: 임수현
     * 기능: 드라이버의 차량 목록 조회
     */
    @GetMapping("/driver")
    public ResponseEntity<List<CarResponseDTO>> getDriverCars(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== getDriverCars 호출됨 ===");
            log.info("요청된 authHeader: {}", authHeader);
            
            Long userId = extractUserIdFromToken(authHeader);
            log.info("JWT에서 추출된 userId: {}", userId);
            
            Long driverId = getDriverIdByUserId(userId);
            log.info("조회된 driverId: {}", driverId);
            
            List<CarResponseDTO> cars = carService.getCarsByDriverId(driverId);
            log.info("조회된 차량 수: {}", cars.size());
            
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            log.error("getDriverCars 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 작성자: 임수현
     * 기능: 차량 상세 조회
     */
    @GetMapping("/driver/{carId}")
    public ResponseEntity<CarResponseDTO> getDriverCar(@PathVariable Long carId, 
                                                     @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== getDriverCar 호출됨 - carId: {} ===", carId);
            
            Long userId = extractUserIdFromToken(authHeader);
            Long driverId = getDriverIdByUserId(userId);
            
            // 차량 목록에서 해당 carId의 차량 찾기
            List<CarResponseDTO> cars = carService.getCarsByDriverId(driverId);
            CarResponseDTO targetCar = cars.stream()
                    .filter(car -> car.getCarId().equals(carId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("해당 차량을 찾을 수 없습니다. carId: " + carId));
            
            return ResponseEntity.ok(targetCar);
        } catch (Exception e) {
            log.error("getDriverCar 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 작성자: 임수현
     * 기능: 차량 추가
     */
    @PostMapping("/driver")
    public ResponseEntity<CarResponseDTO> createDriverCar(@RequestBody CarRequestDTO carRequestDTO,
                                                        @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== createDriverCar 호출됨 ===");
            log.info("요청된 carRequestDTO: {}", carRequestDTO);
            
            Long userId = extractUserIdFromToken(authHeader);
            Long driverId = getDriverIdByUserId(userId);
            
            CarResponseDTO createdCar = carService.createCar(driverId, carRequestDTO);
            log.info("차량 생성 완료 - carId: {}", createdCar.getCarId());
            
            return ResponseEntity.ok(createdCar);
        } catch (Exception e) {
            log.error("createDriverCar 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 작성자: 임수현
     * 기능: 차량 수정
     */
    @PutMapping("/driver/{carId}")
    public ResponseEntity<CarResponseDTO> updateDriverCar(@PathVariable Long carId,
                                                        @RequestBody CarRequestDTO carRequestDTO,
                                                        @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== updateDriverCar 호출됨 - carId: {} ===", carId);
            log.info("요청된 carRequestDTO: {}", carRequestDTO);
            
            Long userId = extractUserIdFromToken(authHeader);
            Long driverId = getDriverIdByUserId(userId);
            
            // 먼저 해당 차량이 자신의 차량인지 확인
            List<CarResponseDTO> cars = carService.getCarsByDriverId(driverId);
            boolean isMyCar = cars.stream().anyMatch(car -> car.getCarId().equals(carId));
            if (!isMyCar) {
                throw new IllegalArgumentException("해당 차량을 수정할 권한이 없습니다. carId: " + carId);
            }
            
            CarResponseDTO updatedCar = carService.updateCar(carId, carRequestDTO);
            log.info("차량 수정 완료 - carId: {}", updatedCar.getCarId());
            
            return ResponseEntity.ok(updatedCar);
        } catch (Exception e) {
            log.error("updateDriverCar 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 작성자: 임수현
     * 기능: 차량 삭제
     */
    @DeleteMapping("/driver/{carId}")
    public ResponseEntity<Void> deleteDriverCar(@PathVariable Long carId,
                                              @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== deleteDriverCar 호출됨 - carId: {} ===", carId);
            
            Long userId = extractUserIdFromToken(authHeader);
            Long driverId = getDriverIdByUserId(userId);
            
            // 먼저 해당 차량이 자신의 차량인지 확인
            List<CarResponseDTO> cars = carService.getCarsByDriverId(driverId);
            boolean isMyCar = cars.stream().anyMatch(car -> car.getCarId().equals(carId));
            if (!isMyCar) {
                throw new IllegalArgumentException("해당 차량을 삭제할 권한이 없습니다. carId: " + carId);
            }
            
            carService.deleteCar(carId);
            log.info("차량 삭제 완료 - carId: {}", carId);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("deleteDriverCar 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 작성자: 임수현
     * 기능: 차량 일괄 저장 (추가, 수정, 삭제)
     */
    @PostMapping("/batch")
    public ResponseEntity<List<CarResponseDTO>> batchSaveCars(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== batchSaveCars 호출됨 ===");
            log.info("요청된 request: {}", request);
            log.info("요청된 authHeader: {}", authHeader);
            
            Long userId = extractUserIdFromToken(authHeader);
            Long driverId = getDriverIdByUserId(userId);
            log.info("조회된 driverId: {}", driverId);
            
            List<CarResponseDTO> results = carService.batchSaveCars(driverId, request);
            log.info("일괄 저장 완료 - 처리된 차량 수: {}", results.size());
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("batchSaveCars 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }
} 