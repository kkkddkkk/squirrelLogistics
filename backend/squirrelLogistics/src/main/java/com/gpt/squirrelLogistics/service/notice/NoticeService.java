// src/main/java/com/gpt/squirrelLogistics/service/notice/NoticeService.java
package com.gpt.squirrelLogistics.service.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeResponseDTO;
import com.gpt.squirrelLogistics.entity.notice.Notice;
import com.gpt.squirrelLogistics.repository.notice.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {
    private final NoticeRepository repo;

    private Notice findOr404(Long id) {
        return repo.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다: " + id)
        );
    }

    public List<NoticeResponseDTO> list() {
        try {
            List<Notice> notices = repo.findAll();
            System.out.println("조회된 공지사항 수: " + notices.size()); // 디버깅용
            
            return notices.stream()
                    .sorted(Comparator
                        .comparing(Notice::isPinned).reversed() // 고정된 공지 먼저
                        .thenComparing(Notice::getCreatedAt, Comparator.reverseOrder()) // 최신순
                    )
                    .map(this::toResponse)
                    .toList();
        } catch (Exception e) {
            System.err.println("공지사항 목록 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("공지사항 목록을 불러오는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public List<NoticeResponseDTO> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return list();
        }
        
        return repo.findAll().stream()
                .filter(n -> 
                    (n.getTitle() != null && n.getTitle().toLowerCase().contains(keyword.toLowerCase())) ||
                    (n.getContent() != null && n.getContent().toLowerCase().contains(keyword.toLowerCase()))
                )
                .sorted(Comparator
                    .comparing(Notice::isPinned).reversed() // 고정된 공지 먼저
                    .thenComparing(Notice::getCreatedAt, Comparator.reverseOrder()) // 최신순
                )
                .map(this::toResponse)
                .toList();
    }

    public NoticeResponseDTO get(Long id) {
        return toResponse(findOr404(id));
    }

    @Transactional
    public NoticeResponseDTO create(NoticeRequestDTO d) {
        try {
            Notice notice = Notice.builder()
                    .title(d.getTitle().trim())
                    .content(d.getContent().trim())
                    .pinned(d.getPinned() != null ? d.getPinned() : false)
                    .adminId(1L) // 임시 관리자 ID 고정
                    .build();
            
            Notice saved = repo.save(notice);
            return toResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("공지사항 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    public NoticeResponseDTO update(Long id, NoticeRequestDTO d) {
        Notice n = findOr404(id);
        n.setTitle(d.getTitle());
        n.setContent(d.getContent());
        if (d.getPinned() != null) n.setPinned(d.getPinned());
        n.setAdminId(1L); // 업데이트 시에도 임시 관리자 ID 고정
        return toResponse(n);
    }

    @Transactional
    public void delete(Long id) {
        Notice n = findOr404(id);
        repo.delete(n);
    }

    private NoticeResponseDTO toResponse(Notice n) {
        try {
            if (n == null) {
                throw new IllegalArgumentException("Notice 객체가 null입니다.");
            }
            
            return NoticeResponseDTO.builder()
                    .id(n.getId())
                    .title(n.getTitle() != null ? n.getTitle() : "")
                    .content(n.getContent() != null ? n.getContent() : "")
                    .pinned(n.isPinned())
                    .createdAt(n.getCreatedAt())
                    .updatedAt(n.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            System.err.println("NoticeResponseDTO 변환 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("공지사항 데이터 변환 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}
