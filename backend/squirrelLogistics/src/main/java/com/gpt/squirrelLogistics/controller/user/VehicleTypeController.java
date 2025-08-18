package com.gpt.squirrelLogistics.controller.user;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;

import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.service.user.VehicleTypeService;

@RestController
@RequestMapping("/api/vehicle-types")
public class VehicleTypeController {

	private final VehicleTypeService service;

	public VehicleTypeController(VehicleTypeService service) {
		this.service = service;
	}

	/** 프론트가 사용하는 엔드포인트 — 엔티티 노출 금지, DTO로 변환해서 반환 */
	@GetMapping
	@Transactional(readOnly = true)
	public List<VehicleTypeResponseDTO> list() {
		List<VehicleType> entities = service.findAllWithFallback();

		// ✅ 엔티티 → DTO 매핑 (프록시 필드 직렬화 안 함)
		return entities.stream().map(v -> new VehicleTypeResponseDTO(v.getVehicleTypeId(), // PK
				v.getName() // 이름
		// 필요하면 생성자 늘려서 maxWeight도 넣기
		)).toList();
	}
}
