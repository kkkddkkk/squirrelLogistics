package com.gpt.squirrelLogistics.service.user;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

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
        return list; // DB에 있는 실제 데이터만 반환
    }

    /** 시드용: 애플리케이션 기동 시 DB가 비면 기본값 저장 (영구) */
    @Transactional
    public void seedIfEmpty() {
        // DB에 데이터가 있으면 그대로 사용, 없으면 기본값 저장
        if (repository.count() == 0) {
            // 기본 차량 데이터가 필요하다면 여기에 추가
            // repository.saveAll(List.of(...));
        }
    }
}