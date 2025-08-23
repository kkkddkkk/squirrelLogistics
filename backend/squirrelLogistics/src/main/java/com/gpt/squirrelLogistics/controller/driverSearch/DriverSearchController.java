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
            DriverSearchPageResponseDTO results = driverSearchService.searchDrivers(request);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Driver Search API is working!");
    }
}
