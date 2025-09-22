package com.gpt.squirrelLogistics.dto.user;

import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserUpsertReq(
        @NotBlank @Size(max = 255) String loginId,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 255) String pnumber,
        @Size(max = 255) String account,
        @Size(max = 255) String businessN,
        // "yyyy-MM-dd" (옵션)
        String birthday,
        UserRoleEnum role
) {}