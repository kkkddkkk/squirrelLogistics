package com.gpt.squirrelLogistics.controller.policy;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.policy.PolicyRequestDTO;
import com.gpt.squirrelLogistics.dto.policy.PolicyResponseDTO;
import com.gpt.squirrelLogistics.service.policy.PolicyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PolicyController {
    
    private final PolicyService service;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "type", required = false) String type) {
        
        try {
            List<?> result;
            if (search != null && !search.trim().isEmpty()) {
                result = service.search(search, type);
            } else if (type != null && !type.trim().isEmpty()) {
                result = service.listByType(type);
            } else {
                result = service.list();
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", result,
                "message", "정책 목록을 성공적으로 조회했습니다.",
                "total", result.size()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("정책 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "정책 목록 조회에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        try {
            PolicyResponseDTO policy = service.get(id);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", policy,
                "message", "정책을 성공적으로 조회했습니다."
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("정책 조회 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "정책 조회에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
    
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody PolicyRequestDTO dto) {
        try {
            System.out.println("정책 생성 요청: " + dto);
            PolicyResponseDTO created = service.create(dto);
            System.out.println("정책 생성 성공: " + created);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", created,
                "message", "정책이 성공적으로 등록되었습니다."
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("정책 생성 실패: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "정책 등록에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @Valid @RequestBody PolicyRequestDTO dto) {
        try {
            PolicyResponseDTO updated = service.update(id, dto);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "data", updated,
                "message", "정책이 성공적으로 수정되었습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("정책 수정 실패 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "정책 수정에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "정책이 성공적으로 삭제되었습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("정책 삭제 실패 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "정책 삭제에 실패했습니다: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
