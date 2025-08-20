package com.gpt.squirrelLogistics.service.banner;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.banner.BannerRequestDTO;
import com.gpt.squirrelLogistics.dto.banner.BannerResponseDTO;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.banner.Banner;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.banner.BannerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BannerService {

    private final BannerRepository bannerRepository;

    /**
     * 배너 목록 조회 (필터링, 정렬, 페이지네이션 지원)
     */
    public List<BannerResponseDTO> getBanners(String keyword, String status, String position, 
                                            String sortBy, String sortOrder, int page, int pageSize) {
        
        // 정렬 설정
        Sort sort = createSort(sortBy, sortOrder);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        
        // 필터링 조건에 따른 쿼리 실행
        Page<Banner> bannerPage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 키워드 검색
            bannerPage = bannerRepository.findByKeywordAndFilters(keyword, status, position, pageable);
        } else if (status != null || position != null) {
            // 상태/위치 필터링
            bannerPage = bannerRepository.findByFilters(status, position, pageable);
        } else {
            // 전체 조회
            bannerPage = bannerRepository.findAll(pageable);
        }
        
        return bannerPage.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * 단일 배너 조회
     */
    public BannerResponseDTO getBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + id));
        
        return convertToResponseDTO(banner);
    }

    /**
     * 배너 생성
     */
    @Transactional
    public BannerResponseDTO createBanner(BannerRequestDTO requestDTO) {
        // AdminUser 객체 생성 (임시로 생성)
        AdminUser adminUser = createTemporaryAdminUser(requestDTO.getAdminId());
        
        Banner banner = Banner.builder()
                .adminUser(adminUser)
                .title(requestDTO.getTitle())
                .imageUrl(requestDTO.getImageUrl())
                .isActive(requestDTO.isActive())
                .regDate(LocalDateTime.now())
                .modiDate(LocalDateTime.now())
                .build();
        
        Banner savedBanner = bannerRepository.save(banner);
        return convertToResponseDTO(savedBanner);
    }

    /**
     * 배너 수정
     */
    @Transactional
    public BannerResponseDTO updateBanner(Long id, BannerRequestDTO requestDTO) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + id));
        
        // 기존 DTO 필드만 업데이트
        banner.setTitle(requestDTO.getTitle());
        banner.setImageUrl(requestDTO.getImageUrl());
        banner.setActive(requestDTO.isActive());
        banner.setModiDate(LocalDateTime.now());
        
        Banner updatedBanner = bannerRepository.save(banner);
        return convertToResponseDTO(updatedBanner);
    }

    /**
     * 배너 삭제
     */
    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new RuntimeException("배너를 찾을 수 없습니다. ID: " + id);
        }
        
        bannerRepository.deleteById(id);
    }

    /**
     * 배너 상태 토글
     */
    @Transactional
    public BannerResponseDTO toggleBannerStatus(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + id));
        
        banner.setActive(!banner.isActive());
        banner.setModiDate(LocalDateTime.now());
        
        Banner updatedBanner = bannerRepository.save(banner);
        return convertToResponseDTO(updatedBanner);
    }

    /**
     * 배너 순서 변경 (간단한 방식으로 구현)
     */
    @Transactional
    public void reorderBanners(List<ReorderRequest> orderRequests) {
        for (ReorderRequest request : orderRequests) {
            Banner banner = bannerRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + request.getId()));
            
            // 순서 정보는 별도 테이블이나 메모 필드에 저장
            // 여기서는 간단히 수정일만 업데이트
            banner.setModiDate(LocalDateTime.now());
            bannerRepository.save(banner);
        }
    }

    /**
     * 일괄 배너 업데이트 (간단한 방식으로 구현)
     */
    @Transactional
    public void bulkUpdateBanners(List<BulkUpdateRequest> bulkRequests) {
        for (BulkUpdateRequest request : bulkRequests) {
            Banner banner = bannerRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + request.getId()));
            
            if (request.getStatus() != null) {
                banner.setActive("ACTIVE".equals(request.getStatus()));
            }
            
            banner.setModiDate(LocalDateTime.now());
            bannerRepository.save(banner);
        }
    }

    /**
     * 배너 통계 조회 (간단한 방식으로 구현)
     */
    public BannerStats getBannerStats() {
        long total = bannerRepository.count();
        long active = bannerRepository.countByIsActiveTrue();
        long inactive = bannerRepository.countByIsActiveFalse();
        
        return new BannerStats(total, active, inactive);
    }

    /**
     * 배너 통계 업데이트 (간단한 방식으로 구현)
     */
    @Transactional
    public void updateBannerStats(Long id, String type) {
        // 통계 정보는 별도 테이블에 저장하거나 로그로 기록
        // 여기서는 수정일만 업데이트
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배너를 찾을 수 없습니다. ID: " + id));
        
        banner.setModiDate(LocalDateTime.now());
        bannerRepository.save(banner);
    }

    /**
     * 배너 데이터 내보내기
     */
    public String exportBanners(String format) {
        List<Banner> banners = bannerRepository.findAll();
        
        if ("csv".equals(format)) {
            return exportToCSV(banners);
        } else {
            return exportToJSON(banners);
        }
    }

    // ==================== Private Methods ====================

    /**
     * 임시 AdminUser 객체 생성 (개발용)
     */
    private AdminUser createTemporaryAdminUser(Long adminId) {
        // 임시 User 객체 생성
        User tempUser = User.builder()
                .userId(adminId)
                .loginId("admin")
                .email("admin@temp.com")
                .password("temp")
                .name("임시 관리자")
                .Pnumber("010-0000-0000")
                .regDate(LocalDateTime.now())
                .modiDate(LocalDateTime.now())
                .build();
        
        // 임시 AdminUser 객체 생성
        return AdminUser.builder()
                .adminId(adminId)
                .user(tempUser)
                .build();
    }

    /**
     * 정렬 설정 생성
     */
    private Sort createSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        
        switch (sortBy) {
            case "created":
                return Sort.by(direction, "regDate");
            case "updated":
                return Sort.by(direction, "modiDate");
            case "title":
                return Sort.by(direction, "title");
            default:
                return Sort.by(direction, "regDate");
        }
    }

    /**
     * 순서 중복 검증 (간단한 방식)
     */
    private void validateOrderUniqueness(String position, Integer order, Long excludeId) {
        // 기존 DTO에 위치와 순서 필드가 없으므로 간단한 검증만 수행
        // 실제로는 별도 테이블이나 메모 필드에 저장된 정보를 확인
    }

    /**
     * Entity를 ResponseDTO로 변환 (기존 DTO 구조에 맞춤)
     */
    private BannerResponseDTO convertToResponseDTO(Banner banner) {
        return BannerResponseDTO.builder()
                .bannerId(banner.getBannerId())
                .adminUser(createAdminUserResponseDTO(banner.getAdminUser()))
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .isActive(banner.isActive())
                .regDate(banner.getRegDate())
                .modiDate(banner.getModiDate())
                .build();
    }

    /**
     * AdminUser 엔티티를 AdminUserResponseDTO로 변환
     */
    private AdminUserResponseDTO createAdminUserResponseDTO(AdminUser adminUser) {
        if (adminUser == null) {
            return null;
        }
        
        return AdminUserResponseDTO.builder()
                .adminId(adminUser.getAdminId())
                .user(null) // User 정보는 필요시 별도 처리
                .build();
    }

    /**
     * CSV 형식으로 내보내기
     */
    private String exportToCSV(List<Banner> banners) {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,제목,이미지URL,상태,생성일,수정일\n");
        
        for (Banner banner : banners) {
            csv.append(String.format("%d,\"%s\",\"%s\",%s,\"%s\",\"%s\"\n",
                    banner.getBannerId(),
                    banner.getTitle(),
                    banner.getImageUrl(),
                    banner.isActive() ? "노출" : "비노출",
                    banner.getRegDate(),
                    banner.getModiDate()
            ));
        }
        
        return csv.toString();
    }

    /**
     * JSON 형식으로 내보내기
     */
    private String exportToJSON(List<Banner> banners) {
        StringBuilder json = new StringBuilder();
        json.append("{\"banners\":[");
        
        for (int i = 0; i < banners.size(); i++) {
            Banner banner = banners.get(i);
            if (i > 0) json.append(",");
            
            json.append("{");
            json.append("\"id\":").append(banner.getBannerId()).append(",");
            json.append("\"title\":\"").append(banner.getTitle()).append("\",");
            json.append("\"imageUrl\":\"").append(banner.getImageUrl()).append("\",");
            json.append("\"status\":\"").append(banner.isActive() ? "노출" : "비노출").append("\"");
            json.append("}");
        }
        
        json.append("]}");
        return json.toString();
    }

    // ==================== 내부 클래스들 ====================
    
    /**
     * 순서 변경 요청을 위한 내부 클래스
     */
    public static class ReorderRequest {
        private Long id;
        private Integer order;
        
        public ReorderRequest() {}
        
        public ReorderRequest(Long id, Integer order) {
            this.id = id;
            this.order = order;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getOrder() { return order; }
        public void setOrder(Integer order) { this.order = order; }
    }
    
    /**
     * 일괄 업데이트 요청을 위한 내부 클래스
     */
    public static class BulkUpdateRequest {
        private Long id;
        private String status;
        
        public BulkUpdateRequest() {}
        
        public BulkUpdateRequest(Long id, String status) {
            this.id = id;
            this.status = status;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    /**
     * 배너 통계를 위한 내부 클래스
     */
    public static class BannerStats {
        private long total;
        private long active;
        private long inactive;
        
        public BannerStats(long total, long active, long inactive) {
            this.total = total;
            this.active = active;
            this.inactive = inactive;
        }
        
        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getInactive() { return inactive; }
    }
}
