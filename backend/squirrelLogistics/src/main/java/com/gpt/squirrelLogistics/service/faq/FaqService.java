package com.gpt.squirrelLogistics.service.faq;

import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqRequestDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.faq.Faq;
import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import com.gpt.squirrelLogistics.repository.faq.FaqRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {
    private final FaqRepository repo;

    public List<FaqResponseDTO> list() {
        try {
            List<Faq> faqs = repo.findAll();
            System.out.println("조회된 FAQ 수: " + faqs.size()); // 디버깅용
            
            return faqs.stream()
                    .sorted(Comparator
                        .comparing(Faq::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())) // null 안전한 정렬
                        .thenComparing(Faq::getId, Comparator.reverseOrder()) // ID로 보조 정렬
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("FAQ 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public List<FaqSlimResponseDTO> listSlim() {
        try {
            List<Faq> faqs = repo.findAll();
            return faqs.stream()
                    .sorted(Comparator
                        .comparing(Faq::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())) // null 안전한 정렬
                        .thenComparing(Faq::getId, Comparator.reverseOrder()) // ID로 보조 정렬
                    )
                    .map(this::toSlim)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("FAQ 슬림 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 슬림 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public FaqResponseDTO get(Long id) {
        try {
            Faq faq = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("FAQ를 찾을 수 없습니다. (ID: " + id + ")"));
            return toResponse(faq);
        } catch (Exception e) {
            System.err.println("FAQ 조회 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    public FaqResponseDTO create(FaqRequestDTO dto) {
        try {
            // 입력 데이터 검증 및 정리
            String question = dto.getQuestion() != null ? dto.getQuestion().trim() : "";
            String answer = dto.getAnswer() != null ? dto.getAnswer().trim() : "";
            
            if (question.isEmpty()) {
                throw new IllegalArgumentException("질문은 필수입니다.");
            }
            if (answer.isEmpty()) {
                throw new IllegalArgumentException("답변은 필수입니다.");
            }
            
            // FAQ 엔티티 생성
            Faq faq = Faq.builder()
                    .question(question)
                    .answer(answer)
                    .category(dto.getCategory() != null ? dto.getCategory() : FaqCategoryEnum.ETC)
                    .adminId(1L) // 임시 관리자 ID (실제 구현 시 인증된 사용자 ID 사용)
                    .build();
            
            Faq saved = repo.save(faq);
            System.out.println("FAQ 생성 완료: " + saved.getId()); // 로깅
            
            return toResponse(saved);
        } catch (Exception e) {
            System.err.println("FAQ 생성 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    public FaqResponseDTO update(Long id, FaqRequestDTO dto) {
        try {
            Faq faq = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("수정할 FAQ를 찾을 수 없습니다. (ID: " + id + ")"));
            
            // 입력 데이터 검증 및 정리
            String question = dto.getQuestion() != null ? dto.getQuestion().trim() : "";
            String answer = dto.getAnswer() != null ? dto.getAnswer().trim() : "";
            
            if (question.isEmpty()) {
                throw new IllegalArgumentException("질문은 필수입니다.");
            }
            if (answer.isEmpty()) {
                throw new IllegalArgumentException("답변은 필수입니다.");
            }
            
            // FAQ 업데이트
            faq.setQuestion(question);
            faq.setAnswer(answer);
            if (dto.getCategory() != null) {
                faq.setCategory(dto.getCategory());
            }
            
            Faq updated = repo.save(faq);
            System.out.println("FAQ 수정 완료: " + updated.getId()); // 로깅
            
            return toResponse(updated);
        } catch (Exception e) {
            System.err.println("FAQ 수정 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 수정 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void delete(Long id) {
        try {
            if (!repo.existsById(id)) {
                throw new RuntimeException("삭제할 FAQ를 찾을 수 없습니다. (ID: " + id + ")");
            }
            
            repo.deleteById(id);
            System.out.println("FAQ 삭제 완료: " + id); // 로깅
        } catch (Exception e) {
            System.err.println("FAQ 삭제 중 에러 발생 (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // 검색 기능
    public List<FaqResponseDTO> search(String keyword, String category) {
        try {
            List<Faq> faqs = repo.findAll();
            
            return faqs.stream()
                    .filter(faq -> {
                        // 키워드 검색 (질문과 답변에서 검색)
                        boolean matchesKeyword = faq.getQuestion().toLowerCase().contains(keyword.toLowerCase()) ||
                                               faq.getAnswer().toLowerCase().contains(keyword.toLowerCase());
                        
                        // 카테고리 필터링
                        boolean matchesCategory = category == null || 
                                               category.isEmpty() || 
                                               faq.getCategory().name().equalsIgnoreCase(category);
                        
                        return matchesKeyword && matchesCategory;
                    })
                    .sorted(Comparator
                        .comparing(Faq::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())) // null 안전한 정렬
                        .thenComparing(Faq::getId, Comparator.reverseOrder()) // ID로 보조 정렬
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("FAQ 검색 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 검색 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // 카테고리별 조회
    public List<FaqResponseDTO> listByCategory(String category) {
        try {
            List<Faq> faqs = repo.findAll();
            
            return faqs.stream()
                    .filter(faq -> faq.getCategory().name().equalsIgnoreCase(category))
                    .sorted(Comparator
                        .comparing(Faq::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())) // null 안전한 정렬
                        .thenComparing(Faq::getId, Comparator.reverseOrder()) // ID로 보조 정렬
                    )
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("카테고리별 FAQ 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("카테고리별 FAQ 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // ===== mapping =====

    private FaqResponseDTO toResponse(Faq faq) {
        try {
            if (faq == null) {
                throw new IllegalArgumentException("FAQ 객체가 null입니다.");
            }
            
            return FaqResponseDTO.builder()
                    .faqId(faq.getId())
                    .adminUserDTO(toAdminUserDTO(faq.getAdminId()))
                    .question(faq.getQuestion() != null ? faq.getQuestion() : "")
                    .answer(faq.getAnswer() != null ? faq.getAnswer() : "")
                    .category(faq.getCategory())
                    .regDate(faq.getCreatedAt())
                    .modiDate(faq.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            System.err.println("FaqResponseDTO 변환 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 데이터 변환 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private FaqSlimResponseDTO toSlim(Faq faq) {
        try {
            if (faq == null) {
                throw new IllegalArgumentException("FAQ 객체가 null입니다.");
            }
            
            return FaqSlimResponseDTO.builder()
                    .faqId(faq.getId())
                    .question(faq.getQuestion() != null ? faq.getQuestion() : "")
                    .category(faq.getCategory())
                    .build();
        } catch (Exception e) {
            System.err.println("FaqSlimResponseDTO 변환 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("FAQ 슬림 데이터 변환 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private AdminUserResponseDTO toAdminUserDTO(Long adminId) {
        if (adminId == null) return null;
        // TODO: AdminUser 조회 연동시 실제 데이터로 변환
        return AdminUserResponseDTO.builder().adminId(adminId).build();
    }
}
