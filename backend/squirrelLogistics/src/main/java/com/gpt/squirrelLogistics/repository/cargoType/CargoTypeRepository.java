package com.gpt.squirrelLogistics.repository.cargoType;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.cargoType.CargoType;

public interface CargoTypeRepository extends JpaRepository<CargoType, Long> {

	//2025.08.21 정윤진 추가
	Optional<CargoType> findByHandlingTags(String handlingTags);
}
