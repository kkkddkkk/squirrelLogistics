package com.gpt.squirrelLogistics.controller.vehicle;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gpt.squirrelLogistics.dto.car.CarRequestDTO;
import com.gpt.squirrelLogistics.dto.car.CarResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
@RequiredArgsConstructor
@Log4j2
public class VehicleController {

    // 차량 목록 조회 (페이징)
    @GetMapping
    public ResponseEntity<PageResponseDTO<CarResponseDTO>> getVehicleList(PageRequestDTO pageRequestDTO) {
        // TODO: 차량 목록 조회 (페이징 처리)
        return ResponseEntity.ok().build();
    }

    // 차량 등록
    @PostMapping
    public ResponseEntity<CarResponseDTO> registerVehicle(@RequestBody CarRequestDTO carRequestDTO) {
        // TODO: 새로운 차량 등록
        return ResponseEntity.ok().build();
    }

    // 차량 정보 수정
    @PutMapping("/{vehicleId}")
    public ResponseEntity<CarResponseDTO> updateVehicle(@PathVariable Long vehicleId, @RequestBody CarRequestDTO carRequestDTO) {
        // TODO: 차량 정보 수정
        return ResponseEntity.ok().build();
    }

    // 차량 삭제
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long vehicleId) {
        // TODO: 차량 삭제
        return ResponseEntity.ok().build();
    }

    // 차량 정보 업데이트 (점검, 보험, 주행거리 등)
    @PatchMapping("/{vehicleId}")
    public ResponseEntity<CarResponseDTO> updateVehicleInfo(
            @PathVariable Long vehicleId, 
            @RequestBody VehicleUpdateRequest request) {
        // TODO: 차량 정보 업데이트 (점검일, 보험정보, 주행거리 등)
        return ResponseEntity.ok().build();
    }

    // 내부 클래스들
    public static class VehicleUpdateRequest {
        private String carNum;
        private Long mileage;
        private String etc;
        private String inspection;
        private boolean insurance;
        private Long vehicleTypeId;
        
        // getters and setters
        public String getCarNum() { return carNum; }
        public void setCarNum(String carNum) { this.carNum = carNum; }
        public Long getMileage() { return mileage; }
        public void setMileage(Long mileage) { this.mileage = mileage; }
        public String getEtc() { return etc; }
        public void setEtc(String etc) { this.etc = etc; }
        public String getInspection() { return inspection; }
        public void setInspection(String inspection) { this.inspection = inspection; }
        public boolean isInsurance() { return insurance; }
        public void setInsurance(boolean insurance) { this.insurance = insurance; }
        public Long getVehicleTypeId() { return vehicleTypeId; }
        public void setVehicleTypeId(Long vehicleTypeId) { this.vehicleTypeId = vehicleTypeId; }
    }
} 