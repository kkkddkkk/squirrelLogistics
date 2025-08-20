package com.gpt.squirrelLogistics.controller.faq;

import com.gpt.squirrelLogistics.dto.faq.FaqRequestDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqSlimResponseDTO;
import com.gpt.squirrelLogistics.service.faq.FaqService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/faqs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaqController {

    private final FaqService service;

    // GET /api/public/faqs             -> 상세 리스트(FaqResponseDTO[])
    // GET /api/public/faqs?view=slim   -> 슬림 리스트(FaqSlimResponseDTO[])
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "view", required = false) String view,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            List<?> result;
            if ("slim".equalsIgnoreCase(view)) {
                result = service.listSlim();
            } else if (search != null && !search.trim().isEmpty()) {
                result = service.search(search, category);
            } else if (category != null && !category.trim().isEmpty()) {
                result = service.listByCategory(category);
            } else {
                result = service.list();
            }

            Map<String, Object> response = Map.of(
                "success", true,
                "data", result,
                "message", "FAQ 목록을 성공적으로 조회했습니다.",
                "total", result.size()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("FAQ 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 목록 조회에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        try {
            FaqResponseDTO faq = service.get(id);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", faq,
                "message", "FAQ를 성공적으로 조회했습니다."
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("FAQ 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 조회에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody FaqRequestDTO dto) {
        try {
            System.out.println("FAQ 생성 요청: " + dto); // 로깅 추가
            FaqResponseDTO created = service.create(dto);
            System.out.println("FAQ 생성 성공: " + created); // 로깅 추가
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", created,
                "message", "FAQ가 성공적으로 등록되었습니다."
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("FAQ 생성 실패: " + e.getMessage()); // 로깅 추가
            e.printStackTrace(); // 스택 트레이스 출력
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 등록에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody FaqRequestDTO dto) {
        try {
            System.out.println("FAQ 수정 요청 (ID: " + id + "): " + dto); // 로깅 추가
            FaqResponseDTO updated = service.update(id, dto);
            System.out.println("FAQ 수정 성공: " + updated); // 로깅 추가
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", updated,
                "message", "FAQ가 성공적으로 수정되었습니다."
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("FAQ 수정 실패: " + e.getMessage()); // 로깅 추가
            e.printStackTrace(); // 스택 트레이스 출력
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 수정에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        try {
            System.out.println("FAQ 삭제 요청 (ID: " + id + ")"); // 로깅 추가
            service.delete(id);
            System.out.println("FAQ 삭제 성공 (ID: " + id + ")"); // 로깅 추가
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "FAQ가 성공적으로 삭제되었습니다."
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("FAQ 삭제 실패: " + e.getMessage()); // 로깅 추가
            e.printStackTrace(); // 스택 트레이스 출력
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 삭제에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // 검색 전용 엔드포인트 (기존 list와 중복되지만 명확성을 위해 유지)
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String keyword,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            List<FaqResponseDTO> result = service.search(keyword, category);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", result,
                "message", "검색 결과를 성공적으로 조회했습니다.",
                "total", result.size(),
                "keyword", keyword,
                "category", category != null ? category : "전체"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("FAQ 검색 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "FAQ 검색에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
