package com.gpt.squirrelLogistics.controller.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchPageResponseDTO;
import com.gpt.squirrelLogistics.service.driverSearch.DriverSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search-drivers")
@RequiredArgsConstructor
public class DriverSearchController {
    
    private final DriverSearchService driverSearchService;
    
    @PostMapping("/search")
    public ResponseEntity<DriverSearchPageResponseDTO> searchDrivers(@RequestBody DriverSearchRequestDTO request) {
        try {
            System.out.println("=== 컨트롤러에서 검색 요청 받음 ===");
            System.out.println("요청 DTO: " + request);
            
            DriverSearchPageResponseDTO results = driverSearchService.searchDrivers(request);
            System.out.println("검색 결과: " + results.getTotalElements() + "명의 기사");
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("컨트롤러 에러: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<DriverSearchPageResponseDTO> getAllDrivers() {
        try {
            System.out.println("=== 모든 기사 조회 요청 ===");
            
            // 기본 검색 파라미터로 모든 기사 조회
            DriverSearchRequestDTO defaultRequest = DriverSearchRequestDTO.builder()
                .keyword("")
                .drivable(null)
                .maxWeight(null)
                .vehicleTypeId(null)
                .sortOption("")
                .latitude(null)
                .longitude(null)
                .region("")
                .page(0)
                .size(10)
                .build();
            
            DriverSearchPageResponseDTO results = driverSearchService.searchDrivers(defaultRequest);
            System.out.println("전체 기사 조회 결과: " + results.getTotalElements() + "명의 기사");
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("전체 기사 조회 에러: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Driver Search API is working!");
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getDriverStats() {
        try {
            return ResponseEntity.ok(driverSearchService.getDriverStats());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/history")
    public ResponseEntity<?> saveSearchHistory(@RequestBody DriverSearchRequestDTO request) {
        try {
            return ResponseEntity.ok(driverSearchService.saveSearchHistory(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/location")
    public ResponseEntity<?> searchDriversByLocation(@RequestBody DriverSearchRequestDTO request) {
        try {
            return ResponseEntity.ok(driverSearchService.searchDriversByLocation(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
