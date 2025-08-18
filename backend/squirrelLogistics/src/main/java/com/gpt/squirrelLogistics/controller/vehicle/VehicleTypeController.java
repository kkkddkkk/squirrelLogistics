package com.gpt.squirrelLogistics.controller.vehicle;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.service.user.VehicleTypeService;

@RestController
@RequestMapping("/api/vehicle/type")
public class VehicleTypeController {

    private final VehicleTypeService service;

    public VehicleTypeController(VehicleTypeService service) {
        this.service = service;
    }

    /** 프론트가 사용하는 엔드포인트 */
    @GetMapping
    public List<VehicleType> list() {
        // DB가 비어있으면 기본값(비영구) 반환
        return service.findAllWithFallback();
    }
} 