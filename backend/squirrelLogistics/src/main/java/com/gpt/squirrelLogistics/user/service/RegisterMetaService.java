package com.gpt.squirrelLogistics.user.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.user.Term;
import com.gpt.squirrelLogistics.user.VehicleType;
import com.gpt.squirrelLogistics.user.dto.RegisterMetaResponse;
import com.gpt.squirrelLogistics.user.dto.TermDto;
import com.gpt.squirrelLogistics.user.dto.VehicleTypeDto;
import com.gpt.squirrelLogistics.user.repository.TermRepository;
import com.gpt.squirrelLogistics.user.repository.VehicleTypeRepository;

import jakarta.transaction.Transactional;

@Service
public class RegisterMetaService {

    private final TermRepository termRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    public RegisterMetaService(TermRepository termRepository,
                               VehicleTypeRepository vehicleTypeRepository) {
        this.termRepository = termRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
    }

    @Transactional
    public RegisterMetaResponse getMeta() {
        // 약관: 비어있으면 빈 배열 반환 (프런트가 기본 문구 노출)
        List<TermDto> terms = termRepository.findAll().stream()
                .map(this::toTermDto)
                .toList();

        // 차종: 비어있으면 기본값으로 채워서 반환(비영구)
        List<VehicleTypeDto> vehicleTypes = vehicleTypeRepository.findAll().stream()
                .map(this::toVehicleDto)
                .toList();

        if (vehicleTypes.isEmpty()) {
            vehicleTypes = List.of(
                new VehicleTypeDto(1L, "1톤 트럭"),
                new VehicleTypeDto(2L, "2.5톤 트럭")
            );
        }

        return new RegisterMetaResponse(terms, vehicleTypes);
    }

    private TermDto toTermDto(Term t) {
        return new TermDto(
            t.getId(),
            t.getTermName(),
            t.getTermContent(),
            t.getIsRequired(),
            t.getCreateDT(),
            t.getUpdateDT()
        );
    }

    private VehicleTypeDto toVehicleDto(VehicleType v) {
        return new VehicleTypeDto(v.getId(), v.getName());
    }
}