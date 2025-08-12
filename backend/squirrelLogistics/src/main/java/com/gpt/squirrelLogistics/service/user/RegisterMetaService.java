package com.gpt.squirrelLogistics.service.user;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.regist.RegisterMetaResponse;
import com.gpt.squirrelLogistics.dto.term.TermRequestDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.term.Term;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.repository.term.TermRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

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
        List<TermRequestDTO> terms = termRepository.findAll().stream()
                .map(this::toTermDto)
                .toList();

        // 차종: 비어있으면 기본값으로 채워서 반환(비영구)
        List<VehicleTypeResponseDTO> vehicleTypes = vehicleTypeRepository.findAll().stream()
                .map(this::toVehicleDto)
                .toList();

        if (vehicleTypes.isEmpty()) {
            vehicleTypes = List.of(
                new VehicleTypeResponseDTO(1L, "1톤 트럭"),
                new VehicleTypeResponseDTO(1L, "2.5톤 트럭")
            );
        }

        return new RegisterMetaResponse(terms, vehicleTypes);
    }

    private TermRequestDTO toTermDto(Term t) {
        return new TermRequestDTO(
            t.getTermId(),
            t.getTermName(),
            t.getTermContent(),
            t.isRequired(),
            t.getCreateDT(),
            t.getUpdateDT()
        );
    }

    private VehicleTypeResponseDTO toVehicleDto(VehicleType v) {
        return new VehicleTypeResponseDTO(v.getVehicleTypeId(), v.getName());
    }
}