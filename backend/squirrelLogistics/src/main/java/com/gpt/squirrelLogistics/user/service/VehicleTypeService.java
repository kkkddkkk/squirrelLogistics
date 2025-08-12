package com.gpt.squirrelLogistics.user.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.user.VehicleType;
import com.gpt.squirrelLogistics.user.repository.VehicleTypeRepository;

import jakarta.transaction.Transactional;

@Service
public class VehicleTypeService {

    private final VehicleTypeRepository repository;

    public VehicleTypeService(VehicleTypeRepository repository) {
        this.repository = repository;
    }

    /** 조회용: DB가 비면 기본값(비영구) 반환 */
    @Transactional
    public List<VehicleType> findAllWithFallback() {
        List<VehicleType> list = repository.findAll();
        if (!list.isEmpty()) return list;
        // DB는 그대로 두고, 기본값만 반환 (응답 전용)
        return List.of(
            new VehicleType("1T", "1톤 트럭"),
            new VehicleType("2.5T", "2.5톤 트럭")
        );
    }

    /** 시드용: 애플리케이션 기동 시 DB가 비면 기본값 저장 (영구) */
    @Transactional
    public void seedIfEmpty() {
        if (repository.count() == 0) {
            repository.saveAll(List.of(
                new VehicleType("1T", "1톤 트럭"),
                new VehicleType("2.5T", "2.5톤 트럭")
            ));
        }
    }
}