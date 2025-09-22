package com.gpt.squirrelLogistics.controller.admin;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.term.TermRequestDTO;
import com.gpt.squirrelLogistics.dto.term.TermResponseDTO;
import com.gpt.squirrelLogistics.service.term.TermService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/terms")
public class AdminTermController {

    private final TermService termService;

    // 목록 (검색/페이징)
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Page<TermResponseDTO> result = termService.search(q, page, size);
        return Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "page", result.getNumber(),
                "size", result.getSize()
        );
    }

    // 단건 조회
    @GetMapping("/{id}")
    public TermResponseDTO get(@PathVariable("id") Long id) {
        return termService.get(id);
    }

    // 추가
    @PostMapping
    public ResponseEntity<TermResponseDTO> create(@Valid @RequestBody TermRequestDTO req) {
        TermResponseDTO dto = termService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<TermResponseDTO> update(@PathVariable("id") Long id,
                                                  @Valid @RequestBody TermRequestDTO req) {
        return ResponseEntity.ok(termService.update(id, req));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        termService.delete(id);
        return ResponseEntity.noContent().build();
    }
}