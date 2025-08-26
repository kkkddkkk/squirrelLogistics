package com.gpt.squirrelLogistics.controller.company;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.service.company.CompanyService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyController {
    
    private final CompanyService companyService;
    private final FindUserByTokenService findUserByTokenService;
    
    /**
     * 간단한 테스트 API
     */
    @GetMapping("/test")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of("message", "Company API 정상 작동"));
    }
    
    /**
     * 토큰 기반으로 현재 사용자의 company 정보 조회
     */
    @GetMapping("/current-user")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, Object>> getCurrentUserCompany(HttpServletRequest request) {
//        try {
//            System.out.println("=== getCurrentUserCompany 호출됨 ===");
//            
//            // Spring Security Authentication에서 userId 추출
//            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//            if (auth == null || !auth.isAuthenticated()) {
//                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자"));
//            }
//            
//            // TODO: 실제 JWT 토큰 파싱 로직으로 교체 필요
//            // 현재는 임시로 하드코딩된 userId 사용
//            Long userId = extractUserIdFromAuth(auth);
//            if (userId == null) {
//                return ResponseEntity.status(400).body(Map.of("error", "유효하지 않은 토큰"));
//            }
//            
//            CompanyResponseDTO company = companyService.getCompanyByUserId(userId);
//            if (company != null) {
//                // null 체크를 통한 안전한 응답 생성
//                Map<String, Object> response = new HashMap<>();
//                response.put("companyId", company.getCompanyId()); // null 그대로 내려줌
//                response.put("mainLoca", company.getMainLoca() != null ? company.getMainLoca() : "");
//                
//                return ResponseEntity.ok(response);
//            } else {
//                return ResponseEntity.status(404).body(Map.of("error", "회사 정보를 찾을 수 없습니다"));
//            }
//        } catch (Exception e) {
//            System.err.println("=== getCurrentUserCompany 오류 ===");
//            e.printStackTrace();
//            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
//        }
    	 try {
    	        System.out.println("=== getCurrentUserCompany 호출됨 ===");

    	        // 헤더에서 JWT 토큰 추출
    	        String header = request.getHeader("Authorization");
    	        if (header == null || !header.startsWith("Bearer ")) {
    	            return ResponseEntity.status(401).body(Map.of("error", "토큰이 필요합니다"));
    	        }

    	        String token = header.substring(7);

    	        // ✅ 토큰에서 userId 추출
    	        Long userId = findUserByTokenService.getUserIdByToken(token);
    	        if (userId == null) {
    	            return ResponseEntity.status(400).body(Map.of("error", "유효하지 않은 토큰"));
    	        }

    	        // userId → 회사 정보 조회
    	        CompanyResponseDTO company = companyService.getCompanyByUserId(userId);
    	        if (company != null) {
    	            Map<String, Object> response = new HashMap<>();
    	            response.put("companyId", company.getCompanyId());
    	            response.put("mainLoca", company.getMainLoca() != null ? company.getMainLoca() : "");
    	            return ResponseEntity.ok(response);
    	        } else {
    	            return ResponseEntity.status(404).body(Map.of("error", "회사 정보를 찾을 수 없습니다"));
    	        }
    	    } catch (Exception e) {
    	        System.err.println("=== getCurrentUserCompany 오류 ===");
    	        e.printStackTrace();
    	        return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
    	    }
    }
    
    /**
     * 임시: Authentication에서 userId 추출 (실제로는 JWT 파싱 필요)
     */
    private Long extractUserIdFromAuth(Authentication auth) {
        try {
            // TODO: 실제 JWT 토큰 파싱 로직으로 교체
            // 현재는 임시로 하드코딩된 userId 사용
            return 12L; // 임시 userId
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 기본 주소 저장 (간단한 방식)
     */
    @PostMapping("/save-address")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, Object>> saveAddress(@RequestBody Map<String, Object> request) {
        try {
            // null 체크 및 안전한 파싱
            Object companyIdObj = request.get("companyId");
            Object addressObj = request.get("address");
            Object typeObj = request.get("type");
            
            if (companyIdObj == null || addressObj == null || typeObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "필수 파라미터가 누락되었습니다"));
            }
            
            Long companyId = Long.parseLong(companyIdObj.toString());
            String address = addressObj.toString();
            String type = typeObj.toString(); // START, END, WAYPOINT
            
            // Company의 mainLoca에 저장 (간단한 방식)
            String result = companyService.saveMainAddress(companyId, address);
            return ResponseEntity.ok(Map.of("SUCCESS", result != null ? result : "저장 완료"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "잘못된 companyId 형식입니다"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 기본 주소 조회 (간단한 방식)
     */
    @GetMapping("/get-address/{companyId}")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<String, Object>> getAddress(@PathVariable("companyId") Long companyId) {
        try {
            String mainLoca = companyService.getMainAddress(companyId);
            // null 체크를 통한 안전한 응답
            Map<String, Object> response = new HashMap<>();
            response.put("mainLoca", mainLoca != null ? mainLoca : "");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
