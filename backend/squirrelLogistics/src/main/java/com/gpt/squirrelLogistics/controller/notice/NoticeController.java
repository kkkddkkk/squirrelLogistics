package com.gpt.squirrelLogistics.controller.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeResponseDTO;
import com.gpt.squirrelLogistics.service.notice.NoticeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService service;

    @GetMapping
    public List<NoticeResponseDTO> list() {
        return service.list(); // 프론트는 notice.id / notice.createdAt 사용
    }

    @GetMapping("/{id}")
    public NoticeResponseDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public NoticeResponseDTO create(@Valid @RequestBody NoticeRequestDTO d) {
        return service.create(d);
    }

    @PutMapping("/{id}")
    public NoticeResponseDTO update(@PathVariable Long id, @Valid @RequestBody NoticeRequestDTO d) {
        return service.update(id, d);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
