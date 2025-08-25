package com.gpt.squirrelLogistics.controller.cargoType;

import com.gpt.squirrelLogistics.dto.cargoType.CargoTypeDTO;
import com.gpt.squirrelLogistics.repository.cargoType.CargoTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cargo-types")
@RequiredArgsConstructor
public class CargoTypeController {

    private final CargoTypeRepository cargoTypeRepository;

    @GetMapping
    public List<CargoTypeDTO> list() {
        return cargoTypeRepository.findAll().stream()
                .map(cargoType -> CargoTypeDTO.builder()
                        .handlingId(cargoType.getHandlingId())
                        .handlingTags(cargoType.getHandlingTags())
                        .extraFee(cargoType.getExtraFee())
                        .build())
                .collect(Collectors.toList());
    }
}
