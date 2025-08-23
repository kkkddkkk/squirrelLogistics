package com.gpt.squirrelLogistics.controller.car;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.service.car.CarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;

import java.util.List;

@RestController
@RequestMapping("/api/driver/cars")
@RequiredArgsConstructor
@Log4j2
public class CarController {

    private final CarService carService;
    private final JwtTokenProvider jwtTokenProvider;
    private final DriverRepository driverRepository;

    // JWT 토큰에서 userId와 role 추출하는 공통 메서드
    private Long extractUserIdFromToken(String authHeader) {
        try {
            log.info("=== JWT 토큰 파싱 시작 ===");
            log.info("전체 Authorization 헤더: {}", authHeader);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("유효하지 않은 Authorization 헤더 형식: {}", authHeader);
                throw new IllegalArgumentException("유효하지 않은 Authorization 헤더 형식입니다.");
            }
            
            String token = authHeader.replace("Bearer ", "");
            log.info("정제된 토큰 (처음 50자): {}", token.length() > 50 ? token.substring(0, 50) + "..." : token);
            log.info("토큰 전체 길이: {}", token.length());
            
            Jws<Claims> claims = jwtTokenProvider.parse(token);
            Object uidObj = claims.getBody().get("uid");
            String role = (String) claims.getBody().get("role");
            
            log.info("JWT에서 추출된 uid 원본: {} (타입: {}), role: {}", 
                    uidObj, uidObj != null ? uidObj.getClass().getSimpleName() : "null", role);
            
            Long userId;
            if (uidObj instanceof Integer) {
                userId = ((Integer) uidObj).longValue();
            } else if (uidObj instanceof Long) {
                userId = (Long) uidObj;
            } else if (uidObj instanceof String) {
                userId = Long.parseLong((String) uidObj);
            } else if (uidObj instanceof Double) {
                userId = ((Double) uidObj).longValue();
            } else {
                log.error("지원하지 않는 uid 타입: {}", uidObj != null ? uidObj.getClass().getSimpleName() : "null");
                throw new IllegalArgumentException("JWT에서 uid를 추출할 수 없습니다.");
            }
            
            log.info("최종 추출된 userId: {}, role: {}", userId, role);
            log.info("=== JWT 토큰 파싱 완료 ===");
            return userId;
        } catch (Exception e) {
            log.error("JWT 토큰 파싱 실패 - 상세 오류:", e);
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
    }

    // 기사 차량 목록 조회 (DRIVER, ETC 역할 모두 허용)
    @GetMapping
    public ResponseEntity<?> getDriverCars(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("=== 차량 목록 조회 요청 시작 ===");
            log.info("Authorization 헤더: {}", authHeader);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("유효하지 않은 Authorization 헤더: {}", authHeader);
                return ResponseEntity.badRequest().body("유효하지 않은 Authorization 헤더입니다.");
            }
            
            Long userId = extractUserIdFromToken(authHeader);
            log.info("추출된 userId: {}", userId);
            
            // 모든 Driver를 가져와서 userId로 필터링
            List<Driver> allDrivers = driverRepository.findAll();
            log.info("전체 Driver 수: {}", allDrivers.size());
            
            // 각 Driver의 User 정보 로깅
            allDrivers.forEach(driver -> {
                if (driver.getUser() != null) {
                    log.info("Driver ID: {}, User ID: {}", driver.getDriverId(), driver.getUser().getUserId());
                } else {
                    log.info("Driver ID: {}, User: null", driver.getDriverId());
                }
            });
            
            Driver driver = allDrivers.stream()
                    .filter(d -> d.getUser() != null && d.getUser().getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("기사 정보를 찾을 수 없습니다. userId: " + userId));
            
            log.info("찾은 Driver ID: {}", driver.getDriverId());
            List<CarResponseDTO> cars = carService.getDriverCars(driver.getDriverId());
            log.info("조회된 차량 수: {}", cars.size());
            
            log.info("=== 차량 목록 조회 요청 완료 ===");
            return ResponseEntity.ok(cars);
        } catch (IllegalArgumentException e) {
            log.error("차량 목록 조회 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("차량 목록 조회 실패", e);
            return ResponseEntity.internalServerError().body("서버 내부 오류가 발생했습니다.");
        }
    }

    // 차량 상세 조회
    @GetMapping("/{carId}")
    public ResponseEntity<CarResponseDTO> getCarById(@PathVariable("carId") Long carId) {
        try {
            CarResponseDTO car = carService.getCarById(carId);
            return ResponseEntity.ok(car);
        } catch (IllegalArgumentException e) {
            log.error("차량 상세 조회 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("차량 상세 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 차량 추가
    @PostMapping
    public ResponseEntity<CarResponseDTO> createCar(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CarRequestDTO request) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Driver를 가져와서 userId로 필터링
            List<Driver> allDrivers = driverRepository.findAll();
            Driver driver = allDrivers.stream()
                    .filter(d -> d.getUser() != null && d.getUser().getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("기사 정보를 찾을 수 없습니다."));
            
            CarResponseDTO car = carService.createCar(driver.getDriverId(), request);
            return ResponseEntity.ok(car);
        } catch (IllegalArgumentException e) {
            log.error("차량 추가 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("차량 추가 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 차량 수정
    @PutMapping("/{carId}")
    public ResponseEntity<CarResponseDTO> updateCar(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("carId") Long carId,
            @RequestBody CarRequestDTO request) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Driver를 가져와서 userId로 필터링
            List<Driver> allDrivers = driverRepository.findAll();
            Driver driver = allDrivers.stream()
                    .filter(d -> d.getUser() != null && d.getUser().getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("기사 정보를 찾을 수 없습니다."));
            
            CarResponseDTO car = carService.updateCar(carId, request);
            return ResponseEntity.ok(car);
        } catch (IllegalArgumentException e) {
            log.error("차량 수정 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("차량 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 차량 삭제
    @DeleteMapping("/{carId}")
    public ResponseEntity<Void> deleteCar(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long carId) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // Driver를 가져와서 userId로 필터링
            List<Driver> allDrivers = driverRepository.findAll();
            Driver driver = allDrivers.stream()
                    .filter(d -> d.getUser() != null && d.getUser().getUserId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("기사 정보를 찾을 수 없습니다."));
            
            carService.deleteCar(carId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("차량 삭제 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("차량 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 