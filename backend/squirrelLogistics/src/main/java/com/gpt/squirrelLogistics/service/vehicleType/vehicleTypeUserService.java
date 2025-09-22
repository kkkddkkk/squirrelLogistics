package com.gpt.squirrelLogistics.service.vehicleType;

import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeRequestDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class vehicleTypeUserService {

    private final VehicleTypeRepository vehicleTypeRepository;
    private final AdminUserRepository adminUserRepository;

    @Transactional(readOnly = true)
    public Page<VehicleTypeResponseDTO> search(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "vehicleTypeId"));
        return vehicleTypeRepository.search(q, pageable).map(VehicleTypeMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public VehicleTypeResponseDTO get(Long id) {
        VehicleType vt = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("차량 종류를 찾을 수 없습니다. id=" + id));
        return VehicleTypeMapper.toResponseDTO(vt);
    }

    public VehicleTypeResponseDTO create(VehicleTypeRequestDTO req) {
        if (req.getAdminId() == null) {
            throw new IllegalArgumentException("adminId는 필수입니다.");
        }
        AdminUser admin = adminUserRepository.findById(req.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("관리자를 찾을 수 없습니다. id=" + req.getAdminId()));

        VehicleType vt = VehicleType.builder()
                .adminUser(admin)
                .name(req.getName())
                .maxWeight(req.getMaxWeight())
                .build();

        VehicleType saved = vehicleTypeRepository.save(vt);
        return VehicleTypeMapper.toResponseDTO(saved);
    }

    public VehicleTypeResponseDTO update(Long id, VehicleTypeRequestDTO req) {
        VehicleType vt = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("차량 종류를 찾을 수 없습니다. id=" + id));

        if (req.getAdminId() != null && !req.getAdminId().equals(vt.getAdminUser().getAdminId())) {
            AdminUser admin = adminUserRepository.findById(req.getAdminId())
                    .orElseThrow(() -> new EntityNotFoundException("관리자를 찾을 수 없습니다. id=" + req.getAdminId()));
            vt.setAdminUser(admin);
        }

        VehicleTypeMapper.applyRequest(req, vt);
        return VehicleTypeMapper.toResponseDTO(vt);
    }

    public void delete(Long id) {
        if (vehicleTypeRepository.existsById(id)) {
            vehicleTypeRepository.deleteById(id);
        }
    }

    @Transactional(readOnly = true)
    public List<VehicleTypeResponseDTO> dropdown() {
        return vehicleTypeRepository.findAllForDropdown();
    }
}