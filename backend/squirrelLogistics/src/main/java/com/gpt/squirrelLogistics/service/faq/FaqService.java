package com.gpt.squirrelLogistics.service.faq;

import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqRequestDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqResponseDTO;
import com.gpt.squirrelLogistics.dto.faq.FaqSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.faq.Faq;
import com.gpt.squirrelLogistics.repository.faq.FaqRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqService {
    private final FaqRepository repo;

    public List<FaqResponseDTO> list() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public List<FaqSlimResponseDTO> listSlim() {
        return repo.findAll().stream().map(this::toSlim).toList();
    }

    public FaqResponseDTO get(Long id) {
        return toResponse(repo.findById(id).orElseThrow());
    }

    public FaqResponseDTO create(FaqRequestDTO d) {
        var saved = repo.save(Faq.builder()
                .question(d.getQuestion())
                .answer(d.getAnswer())
                .category(d.getCategory())
                .build());
        return toResponse(saved);
    }

    public FaqResponseDTO update(Long id, FaqRequestDTO d) {
        var f = repo.findById(id).orElseThrow();
        f.setQuestion(d.getQuestion());
        f.setAnswer(d.getAnswer());
        f.setCategory(d.getCategory());
        return toResponse(repo.save(f));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    // ===== mapping =====

    private FaqResponseDTO toResponse(Faq f) {
        return FaqResponseDTO.builder()
                .faqId(f.getId())
                .adminUserDTO(toAdminUserDTO(f.getAdminId()))
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .category(f.getCategory())
                .regDate(f.getCreatedAt())
                .modiDate(f.getUpdatedAt())
                .build();
    }

    private FaqSlimResponseDTO toSlim(Faq f) {
        return FaqSlimResponseDTO.builder()
                .faqId(f.getId())
                .question(f.getQuestion())
                .category(f.getCategory())
                .build();
    }

    private AdminUserResponseDTO toAdminUserDTO(Long adminId) {
        if (adminId == null) return null;
        // TODO: AdminUser 조회 연동시 실제 데이터로 변환
        return AdminUserResponseDTO.builder().adminId(adminId).build();
    }
}
