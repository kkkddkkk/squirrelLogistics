package com.gpt.squirrelLogistics.service.policy;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gpt.squirrelLogistics.dto.policy.PolicyRequestDTO;
import com.gpt.squirrelLogistics.dto.policy.PolicyResponseDTO;
import com.gpt.squirrelLogistics.dto.policy.PolicySlimResponseDTO;
import com.gpt.squirrelLogistics.entity.policy.Policy;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.enums.policy.PolicyTypeEnum;
import com.gpt.squirrelLogistics.repository.policy.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PolicyService {
    
    private final PolicyRepository repo;
    
    private Policy findOr404(Long id) {
        return repo.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "정책을 찾을 수 없습니다: " + id)
        );
    }
    
    public List<PolicyResponseDTO> list() {
        try {
            List<Policy> policies = repo.findAll();
            System.out.println("조회된 정책 수: " + policies.size()); // 디버깅용
            
            return policies.stream()
                    .sorted(Comparator
                        .comparing(Policy::getRegDate, Comparator.nullsLast(Comparator.reverseOrder())) // null 안전한 정렬
                        .thenComparing(Policy::getPolicyId, Comparator.reverseOrder()) // ID로 보조 정렬
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("정책 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    public List<PolicySlimResponseDTO> listSlim() {
        try {
            List<Policy> policies = repo.findAll();
            return policies.stream()
                    .sorted(Comparator
                        .comparing(Policy::getRegDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Policy::getPolicyId, Comparator.reverseOrder())
                    )
                    .map(this::toSlim)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("정책 슬림 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 슬림 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    public PolicyResponseDTO get(Long id) {
        try {
            Policy policy = findOr404(id);
            return toResponse(policy);
        } catch (Exception e) {
            System.err.println("정책 조회 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public PolicyResponseDTO create(PolicyRequestDTO dto) {
        try {
            // 입력 데이터 검증 및 정리
            String title = dto.getTitle() != null ? dto.getTitle().trim() : "";
            String content = dto.getContent() != null ? dto.getContent().trim() : "";
            
            if (title.isEmpty()) {
                throw new IllegalArgumentException("제목은 필수입니다.");
            }
            if (content.isEmpty()) {
                throw new IllegalArgumentException("내용은 필수입니다.");
            }
            
                         // 정책 엔티티 생성
             Policy policy = Policy.builder()
                     .title(title)
                     .content(content)
                     .type(dto.getType() != null ? dto.getType() : PolicyTypeEnum.ETC)
                     .adminUser(createTemporaryAdminUser()) // 임시 관리자 사용자 생성
                     .regDate(LocalDateTime.now())
                     .modiDate(LocalDateTime.now())
                     .build();
            
            Policy saved = repo.save(policy);
            System.out.println("정책 생성 완료: " + saved.getPolicyId()); // 로깅
            
            return toResponse(saved);
        } catch (Exception e) {
            System.err.println("정책 생성 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public PolicyResponseDTO update(Long id, PolicyRequestDTO dto) {
        try {
            Policy policy = findOr404(id);
            
            // 입력 데이터 검증 및 정리
            String title = dto.getTitle() != null ? dto.getTitle().trim() : "";
            String content = dto.getContent() != null ? dto.getContent().trim() : "";
            
            if (title.isEmpty()) {
                throw new IllegalArgumentException("제목은 필수입니다.");
            }
            if (content.isEmpty()) {
                throw new IllegalArgumentException("내용은 필수입니다.");
            }
            
            // 정책 업데이트
            policy.setTitle(title);
            policy.setContent(content);
            if (dto.getType() != null) {
                policy.setType(dto.getType());
            }
            policy.setModiDate(LocalDateTime.now());
            
            Policy updated = repo.save(policy);
            System.out.println("정책 수정 완료: " + updated.getPolicyId()); // 로깅
            
            return toResponse(updated);
        } catch (Exception e) {
            System.err.println("정책 수정 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 수정 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void delete(Long id) {
        try {
            Policy policy = findOr404(id);
            repo.delete(policy);
            System.out.println("정책 삭제 완료: " + id); // 로깅
        } catch (Exception e) {
            System.err.println("정책 삭제 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    public List<PolicyResponseDTO> search(String keyword, String type) {
        try {
            List<Policy> policies = repo.findAll();
            
            return policies.stream()
                    .filter(p -> {
                        boolean matchesSearch = (p.getTitle() != null && p.getTitle().toLowerCase().contains(keyword.toLowerCase())) ||
                                               (p.getContent() != null && p.getContent().toLowerCase().contains(keyword.toLowerCase()));
                        boolean matchesType = type == null || type.isEmpty() || p.getType().name().equals(type);
                        return matchesSearch && matchesType;
                    })
                    .sorted(Comparator
                        .comparing(Policy::getRegDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Policy::getPolicyId, Comparator.reverseOrder())
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("정책 검색 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 검색 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    public List<PolicyResponseDTO> listByType(String type) {
        try {
            List<Policy> policies = repo.findAll();
            
            return policies.stream()
                    .filter(p -> p.getType().name().equals(type))
                    .sorted(Comparator
                        .comparing(Policy::getRegDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Policy::getPolicyId, Comparator.reverseOrder())
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("정책 타입별 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 타입별 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    private PolicyResponseDTO toResponse(Policy policy) {
        try {
            return PolicyResponseDTO.builder()
                    .policyId(policy.getPolicyId())
                    .adminUserDTO(null) // 임시로 null (실제 구현 시 AdminUserResponseDTO 생성)
                    .type(policy.getType())
                    .title(policy.getTitle() != null ? policy.getTitle() : "")
                    .content(policy.getContent() != null ? policy.getContent() : "")
                    .regDate(policy.getRegDate())
                    .modiDate(policy.getModiDate())
                    .build();
        } catch (Exception e) {
            System.err.println("정책 DTO 변환 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 DTO 변환 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    private PolicySlimResponseDTO toSlim(Policy policy) {
        try {
            return PolicySlimResponseDTO.builder()
                    .policyId(policy.getPolicyId())
                    .adminUserId(null) // 임시로 null
                    .adminUserName("관리자") // 임시로 고정값
                    .type(policy.getType())
                    .title(policy.getTitle() != null ? policy.getTitle() : "")
                    .content(policy.getContent() != null ? policy.getContent() : "")
                    .regDate(policy.getRegDate())
                    .modiDate(policy.getModiDate())
                    .build();
        } catch (Exception e) {
            System.err.println("정책 슬림 DTO 변환 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("정책 슬림 DTO 변환 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    // 임시 관리자 사용자 생성 (실제 구현 시 인증된 사용자로 교체)
    private AdminUser createTemporaryAdminUser() {
        try {
            // 간단한 AdminUser 객체 생성
            AdminUser tempAdmin = new AdminUser();
            tempAdmin.setAdminId(1L);
            return tempAdmin;
        } catch (Exception e) {
            System.err.println("임시 관리자 사용자 생성 중 에러: " + e.getMessage());
            e.printStackTrace();
            // 에러가 발생해도 정책 생성은 계속 진행
            AdminUser fallbackAdmin = new AdminUser();
            fallbackAdmin.setAdminId(1L);
            return fallbackAdmin;
        }
    }
}
