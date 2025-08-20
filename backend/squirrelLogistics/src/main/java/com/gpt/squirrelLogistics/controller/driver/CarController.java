package com.gpt.squirrelLogistics.controller.driver;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.service.driver.CarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

@RestController
@RequestMapping("/api/driver/cars")
@RequiredArgsConstructor
@Log4j2
public class CarController {

    private final CarService carService;
    private final JwtTokenProvider jwtTokenProvider;

    // JWT 토큰에서 userId 추출하는 공통 메서드
    private Long extractUserIdFromToken(String authHeader) {
        try {
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
            } else if (uidObj instanceof String) {
                String uidStr = (String) uidObj;
                // "65.0" 같은 형태를 "65"로 변환
                if (uidStr.contains(".")) {
                    uidStr = uidStr.substring(0, uidStr.indexOf("."));
                }
                return Long.valueOf(uidStr);
            } else {
                String uidStr = uidObj.toString();
                // "65.0" 같은 형태를 "65"로 변환
                if (uidStr.contains(".")) {
                    uidStr = uidStr.substring(0, uidStr.indexOf("."));
                }
                return Long.valueOf(uidStr);
            }
        } catch (Exception e) {
            log.error("JWT 토큰에서 userId 추출 실패: {}", e.getMessage(), e);
            throw new IllegalArgumentException("토큰에서 사용자 ID를 추출할 수 없습니다.");
        }
    }

    // 기사의 모든 차량 조회
    @GetMapping
    public ResponseEntity<List<CarResponseDTO>> getDriverCars(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            List<CarResponseDTO> cars = carService.getDriverCars(userId);
            return ResponseEntity.ok(cars);
        } catch (IllegalArgumentException e) {
            log.error("차량 조회 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("차량 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 차량 추가
    @PostMapping
    public ResponseEntity<CarResponseDTO> addCar(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CarRequestDTO carRequest) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            CarResponseDTO newCar = carService.addCar(userId, carRequest);
            return ResponseEntity.ok(newCar);
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
            @PathVariable Long carId,
            @RequestBody CarRequestDTO carRequest) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            CarResponseDTO updatedCar = carService.updateCar(userId, carId, carRequest);
            return ResponseEntity.ok(updatedCar);
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
            carService.deleteCar(userId, carId);
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