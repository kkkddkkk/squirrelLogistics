package com.gpt.squirrelLogistics.controller.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.regist.RegisterMetaResponse;
import com.gpt.squirrelLogistics.service.user.RegisterMetaService;

@RestController
@RequestMapping("/api/public")
public class RegisterMetaController {

    private final RegisterMetaService service;

    public RegisterMetaController(RegisterMetaService service) {
        this.service = service;
    }

    /** Driver/Company 회원가입 폼 공통 메타데이터 */
    @GetMapping("/register-meta")
    public RegisterMetaResponse getRegisterMeta() {
        return service.getMeta();
    }
}
