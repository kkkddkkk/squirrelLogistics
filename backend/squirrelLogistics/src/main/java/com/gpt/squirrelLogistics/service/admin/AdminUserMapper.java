package com.gpt.squirrelLogistics.service.admin;

import com.gpt.squirrelLogistics.dto.user.UserDTO;
import com.gpt.squirrelLogistics.entity.user.User;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class AdminUserMapper {
    private static final DateTimeFormatter D = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static UserDTO toDto(User u) {
        return UserDTO.builder()
                .userId(u.getUserId())
                .loginId(u.getLoginId())
                .name(u.getName())
                .email(u.getEmail())
                .Pnumber(u.getPnumber())
                .password(null)        // 보안상 미노출
                .account(u.getAccount())
                .businessN(u.getBusinessN())
                .birthday(u.getBirthday() != null ? u.getBirthday().format(D) : null)
                .regDate(u.getRegDate())
                .modiDate(u.getModiDate())
                .lastLogin(u.getLastLogin())
                .role(u.getRole())
                .build();
    }

    public static LocalDate parseBirthday(String yyyyMMdd) {
        if (yyyyMMdd == null || yyyyMMdd.isBlank()) return null;
        return LocalDate.parse(yyyyMMdd, D);
    }
}
