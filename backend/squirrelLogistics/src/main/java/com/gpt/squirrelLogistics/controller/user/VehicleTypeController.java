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
		return entities.stream().map(v -> {
			// 디버깅: maxWeight 값 확인
			System.out.println("차량: " + v.getName() + ", maxWeight: " + v.getMaxWeight());
			
			return new VehicleTypeResponseDTO(
				v.getVehicleTypeId(), // PK
				null, // adminUserDTO (필요 없으면 null)
				v.getName(), // 이름
				v.getMaxWeight(), // 최대 적재량
				null // regDate (필요 없으면 null)
			);
		}).toList();
	}
}
