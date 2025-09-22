package com.gpt.squirrelLogistics.service.vehicleType;

import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeRequestDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;

public class VehicleTypeMapper {

	public static VehicleTypeResponseDTO toResponseDTO(VehicleType v) {
        AdminUser au = v.getAdminUser();
        AdminUserResponseDTO adminDTO = null;

        if (au != null) {
            User u = au.getUser();
            String name  = (u != null) ? u.getName()  : null;
            String email = (u != null) ? u.getEmail() : null;

            adminDTO = AdminUserResponseDTO.builder()
                    .adminId(au.getAdminId())
                    .name(name)
                    .email(email)
                    .build();
        }

        return VehicleTypeResponseDTO.builder()
                .vehicleTypeId(v.getVehicleTypeId())
                .adminUserDTO(adminDTO)
                .name(v.getName())
                .maxWeight(v.getMaxWeight())
                .regDate(v.getRegDate())
                .build();
    }

    public static void applyRequest(VehicleTypeRequestDTO req, VehicleType entity) {
        entity.setName(req.getName());
        entity.setMaxWeight(req.getMaxWeight());
    }
}