package com.gpt.squirrelLogistics.service.notice;

import com.gpt.squirrelLogistics.dto.notice.NoticeDetailRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeRequestDTO;
import com.gpt.squirrelLogistics.dto.notice.NoticeSlimCardDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.entity.notice.Notice;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.notice.NoticeRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {
	private final NoticeRepository noticeRepo;
	private final AdminUserRepository adminRepo;

	@Override
	@Transactional
	public Long create(NoticeRequestDTO dto) {
		Notice n = Notice.builder().adminId(dto.getAdminId()).title(dto.getTitle()).content(dto.getContent())
				.pinned(dto.getPinned()).viewCount(0).build();
		return noticeRepo.save(n).getId();
	}

	@Override
	public RequestPageResponseDTO<NoticeSlimCardDTO> list(RequestPageRequestDTO req) {
		int pageIdx = Math.max(req.getPage() - 1, 0);
		int size = Math.max(req.getSize(), 1);

		Sort sort = resolveSort(req.getSortKey());

		Pageable pageable = PageRequest.of(pageIdx, size, sort);

		String keyword = normalize(req.getQ());

		Page<Notice> page = noticeRepo.search(keyword, pageable);

		// 엔티티 -> 슬림 DTO 변환
		List<NoticeSlimCardDTO> list = page.getContent().stream().map(n -> {
			NoticeSlimCardDTO dto = new NoticeSlimCardDTO();
			dto.setId(n.getId());
			dto.setTitle(n.getTitle());
			dto.setPinned(n.isPinned());
			dto.setCreatedAt(n.getCreatedAt());
			return dto;
		}).toList();

		return RequestPageResponseDTO.<NoticeSlimCardDTO>withAll().dtoList(list).pageRequestDTO(req)
				.totalCount(page.getTotalElements()).build();
	}

	@Override
	@Transactional
	public void update(Long id, NoticeRequestDTO dto) {
		Notice n = noticeRepo.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notice not found"));

		n.setTitle(dto.getTitle());
		n.setContent(dto.getContent());
		n.setPinned(dto.getPinned());

	}

	@Override
	@Transactional
	public NoticeDetailRequestDTO getOne(Long id, boolean increaseView) {
		if (increaseView) {
			noticeRepo.incrementViewCount(id); 
		}

		Notice n = noticeRepo.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notice not found"));

		NoticeDetailRequestDTO dto = new NoticeDetailRequestDTO();
		dto.setId(n.getId());
		dto.setTitle(n.getTitle());
		dto.setContent(n.getContent());
		dto.setViewCount(n.getViewCount());
		dto.setPinned(n.isPinned());
		dto.setCreatedAt(n.getCreatedAt());

		Optional<String> writer = adminRepo.findUserNameByAdminId(n.getAdminId());
		dto.setWriter(writer.isPresent() ? writer.get() : "미확인 작성자");

	    String bannerUrl = noticeRepo.findActiveImageUrlByNoticeId(n.getId()).orElse(null);
	    dto.setBannerFileName(bannerUrl);

		return dto;
	}

	@Override
	public void delete(Long id) {
		if (!noticeRepo.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notice not found");
		}
		noticeRepo.deleteById(id);

	}
	
	@Override
	@Transactional
	public void setPinned(Long id, boolean pinned) {
	    int updated = noticeRepo.updatePinned(id, pinned);
	    if (updated == 0) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NOTICE_NOT_FOUND");
	    }
	}

	private Sort resolveSort(String sortKey) {
		if (sortKey == null || sortKey.isBlank()) {
			return Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt"));
		}
		return switch (sortKey.toLowerCase()) {
		case "oldest" -> Sort.by(Sort.Order.desc("pinned"), Sort.Order.asc("createdAt"));
		// 추가 규칙이 필요하면 여기에 case 확장
		default -> Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt"));
		};
	}

	private String normalize(String s) {
		return (s == null) ? null : s.trim();
	}

	private LocalDateTime parseStartDateOrNull(String s) {
		if (s == null || s.isBlank())
			return null;
		try {
			// YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm 형태 가정
			if (s.length() == 10) {
				return LocalDate.parse(s).atStartOfDay();
			}
			return LocalDateTime.parse(s);
		} catch (Exception e) {
			// 파싱 실패 시 무시(필터 미적용)
			return null;
		}
	}
}
