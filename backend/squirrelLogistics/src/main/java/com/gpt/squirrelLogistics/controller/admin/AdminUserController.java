package com.gpt.squirrelLogistics.controller.admin;

import com.gpt.squirrelLogistics.dto.user.AdminUserUpsertReq;
import com.gpt.squirrelLogistics.dto.user.UserDTO;
import com.gpt.squirrelLogistics.service.admin.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService userService;

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Page<UserDTO> result = userService.search(q, page, size);
        return Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "page", result.getNumber(),
                "size", result.getSize()
        );
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AdminUserUpsertReq req) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUserUpsertReq req
    ) {
        try {
            return ResponseEntity.ok(userService.update(id, req));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
