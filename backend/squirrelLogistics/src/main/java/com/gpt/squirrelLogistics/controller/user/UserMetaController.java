package com.gpt.squirrelLogistics.controller.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.regist.RegisterMetaResponse;
import com.gpt.squirrelLogistics.service.user.RegisterMetaService;

@RestController
@RequestMapping("/api/user/meta")
public class UserMetaController {

    private final RegisterMetaService service;

    public UserMetaController(RegisterMetaService service) {
        this.service = service;
    }

    /** Driver/Company 회원가입 폼 공통 메타데이터 */
    @GetMapping("/register")
    public RegisterMetaResponse getRegisterMeta() {
        return service.getMeta();
    }
} 