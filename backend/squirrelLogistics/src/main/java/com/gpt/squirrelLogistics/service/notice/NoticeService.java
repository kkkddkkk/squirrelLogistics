package com.gpt.squirrelLogistics.service.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeResponseDTO;
import com.gpt.squirrelLogistics.entity.notice.Notice;
import com.gpt.squirrelLogistics.repository.notice.NoticeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository repo;

    public List<NoticeResponseDTO> list() {
        // 필요 시 pinned desc, id desc 정렬로 바꿔도 됨
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public NoticeResponseDTO get(Long id) {
        return toResponse(repo.findById(id).orElseThrow());
    }

    public NoticeResponseDTO create(NoticeRequestDTO d) {
        var saved = repo.save(Notice.builder()
                .title(d.getTitle())
                .content(d.getContent())
                .pinned(Boolean.TRUE.equals(d.getPinned()))
                .build());
        return toResponse(saved);
    }

    public NoticeResponseDTO update(Long id, NoticeRequestDTO d) {
        var n = repo.findById(id).orElseThrow();
        n.setTitle(d.getTitle());
        n.setContent(d.getContent());
        if (d.getPinned() != null) n.setPinned(d.getPinned());
        return toResponse(repo.save(n));
    }

    public void delete(Long id) { repo.deleteById(id); }

    // ===== mapping =====
    private NoticeResponseDTO toResponse(Notice n) {
        return NoticeResponseDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .pinned(n.isPinned())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
