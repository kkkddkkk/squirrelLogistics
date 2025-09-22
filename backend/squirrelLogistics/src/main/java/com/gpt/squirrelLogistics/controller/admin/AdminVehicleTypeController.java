package com.gpt.squirrelLogistics.controller.admin;

import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeRequestDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.service.vehicleType.vehicleTypeUserService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vehicle-types")
public class AdminVehicleTypeController {

    private final vehicleTypeUserService vehicleTypeService;

    // 목록(검색/페이징)
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Page<VehicleTypeResponseDTO> result = vehicleTypeService.search(q, page, size);
        return Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "page", result.getNumber(),
                "size", result.getSize()
        );
    }

    // 드롭다운(이름만)
    @GetMapping("/dropdown")
    public List<VehicleTypeResponseDTO> dropdown() {
        return vehicleTypeService.dropdown();
    }

    // 단건 조회
    @GetMapping("/{id}")
    public VehicleTypeResponseDTO get(@PathVariable("id") Long id) {
        return vehicleTypeService.get(id);
    }

    // 추가
    @PostMapping
    public ResponseEntity<VehicleTypeResponseDTO> create(@RequestBody VehicleTypeRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleTypeService.create(req));
    }

    // 수정
    @PutMapping("/{id}")
    public VehicleTypeResponseDTO update(@PathVariable("id") Long id,
                                         @RequestBody VehicleTypeRequestDTO req) {
        return vehicleTypeService.update(id, req);
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        vehicleTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}