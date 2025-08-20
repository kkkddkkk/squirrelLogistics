// src/main/java/com/gpt/squirrelLogistics/controller/notice/NoticeController.java
package com.gpt.squirrelLogistics.controller.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeResponseDTO;
import com.gpt.squirrelLogistics.service.notice.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/notices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NoticeController {

    private final NoticeService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(@RequestParam(required = false) String search) {
        try {
            List<NoticeResponseDTO> notices;
            if (search != null && !search.trim().isEmpty()) {
                notices = service.search(search.trim());
            } else {
                notices = service.list();
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", notices,
                "count", notices.size(),
                "message", "공지사항 목록을 성공적으로 조회했습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "공지사항 목록 조회에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam String keyword) {
        try {
            List<NoticeResponseDTO> notices = service.search(keyword);
            Map<String, Object> response = Map.of(
                "success", true,
                "data", notices,
                "count", notices.size(),
                "keyword", keyword,
                "message", "검색 결과를 성공적으로 조회했습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "검색에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable("id") Long id) {
        try {
            NoticeResponseDTO notice = service.get(id);
            Map<String, Object> response = Map.of(
                "success", true,
                "data", notice,
                "message", "공지사항을 성공적으로 조회했습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody NoticeRequestDTO d) {
        try {
            System.out.println("공지사항 생성 요청: " + d); // 로깅 추가
            NoticeResponseDTO created = service.create(d);
            System.out.println("공지사항 생성 성공: " + created); // 로깅 추가
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", created,
                "message", "공지사항이 성공적으로 등록되었습니다."
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("공지사항 생성 실패: " + e.getMessage()); // 로깅 추가
            e.printStackTrace(); // 스택 트레이스 출력
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "공지사항 등록에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") Long id, 
                                    @Valid @RequestBody NoticeRequestDTO d) {
        try {
            NoticeResponseDTO updated = service.update(id, d);
            Map<String, Object> response = Map.of(
                "success", true,
                "data", updated,
                "message", "공지사항이 성공적으로 수정되었습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Long id) {
        try {
        service.delete(id);
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "공지사항이 성공적으로 삭제되었습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
