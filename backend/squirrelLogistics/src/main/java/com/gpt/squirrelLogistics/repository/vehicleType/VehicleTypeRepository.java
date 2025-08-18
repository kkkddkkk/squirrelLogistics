package com.gpt.squirrelLogistics.repository.vehicleType;

import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {

    // 필요한 필드만 조회해서 바로 DTO로 생성 → 프록시 직렬화 문제 없음
    @Query("""
           select new com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO(
               v.vehicleTypeId, v.name
           )
           from VehicleType v
           order by v.name asc
           """)
    List<VehicleTypeResponseDTO> findAllForDropdown();
}
