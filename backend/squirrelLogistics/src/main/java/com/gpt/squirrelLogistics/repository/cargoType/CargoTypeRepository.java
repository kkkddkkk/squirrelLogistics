package com.gpt.squirrelLogistics.repository.cargoType;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.entity.cargoType.CargoType;

public interface CargoTypeRepository extends JpaRepository<CargoType, Long> {

	
}
