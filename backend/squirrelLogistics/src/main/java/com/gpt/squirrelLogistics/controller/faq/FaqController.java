package com.gpt.squirrelLogistics.controller.faq;

import com.gpt.squirrelLogistics.dto.faq.FaqRequestDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqSlimResponseDTO;
import com.gpt.squirrelLogistics.service.faq.FaqService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs") // 프론트 BASE와 동일
@RequiredArgsConstructor
public class FaqController {

    private final FaqService service;

    // GET /api/faqs             -> 상세 리스트(FaqResponseDTO[])
    // GET /api/faqs?view=slim   -> 슬림 리스트(FaqSlimResponseDTO[])
    @GetMapping
    public List<?> list(@RequestParam(value = "view", required = false) String view) {
        if ("slim".equalsIgnoreCase(view)) return service.listSlim();
        return service.list();
    }

    @GetMapping("/{id}")
    public FaqResponseDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public FaqResponseDTO create(@Valid @RequestBody FaqRequestDTO d) {
        return service.create(d);
    }

    @PutMapping("/{id}")
    public FaqResponseDTO update(@PathVariable Long id, @Valid @RequestBody FaqRequestDTO d) {
        return service.update(id, d);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
