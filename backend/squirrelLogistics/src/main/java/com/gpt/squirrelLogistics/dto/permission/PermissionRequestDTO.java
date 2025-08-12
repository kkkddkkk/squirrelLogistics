package com.gpt.squirrelLogistics.dto.permission;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionRequestDTO {

    private Long adminId; //관리자 아이디.
    private String accessType; //권한 타입.
}
