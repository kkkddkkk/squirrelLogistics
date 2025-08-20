package com.gpt.squirrelLogistics.controller.banner;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.banner.BannerRequestDTO;
import com.gpt.squirrelLogistics.dto.banner.BannerResponseDTO;
import com.gpt.squirrelLogistics.service.banner.BannerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Slf4j
public class BannerController {

    private final BannerService bannerService;

    /**
     * 배너 목록 조회 (필터링, 정렬, 페이지네이션 지원)
     */
    @GetMapping
    public ResponseEntity<List<BannerResponseDTO>> getBanners(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String position,
            @RequestParam(defaultValue = "order") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize) {
        
        log.info("배너 목록 조회 요청 - keyword: {}, status: {}, position: {}, sortBy: {}, page: {}", 
                keyword, status, position, sortBy, page);
        
        List<BannerResponseDTO> banners = bannerService.getBanners(keyword, status, position, sortBy, sortOrder, page, pageSize);
        return ResponseEntity.ok(banners);
    }

    /**
     * 단일 배너 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<BannerResponseDTO> getBanner(@PathVariable Long id) {
        log.info("배너 조회 요청 - id: {}", id);
        
        BannerResponseDTO banner = bannerService.getBanner(id);
        return ResponseEntity.ok(banner);
    }

    /**
     * 배너 생성
     */
    @PostMapping
    public ResponseEntity<BannerResponseDTO> createBanner(@RequestBody BannerRequestDTO requestDTO) {
        log.info("배너 생성 요청 - title: {}", requestDTO.getTitle());
        
        BannerResponseDTO createdBanner = bannerService.createBanner(requestDTO);
        return ResponseEntity.ok(createdBanner);
    }

    /**
     * 배너 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<BannerResponseDTO> updateBanner(
            @PathVariable Long id, 
            @RequestBody BannerRequestDTO requestDTO) {
        log.info("배너 수정 요청 - id: {}, title: {}", id, requestDTO.getTitle());
        
        BannerResponseDTO updatedBanner = bannerService.updateBanner(id, requestDTO);
        return ResponseEntity.ok(updatedBanner);
    }

    /**
     * 배너 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        log.info("배너 삭제 요청 - id: {}", id);
        
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 배너 상태 토글 (노출/비노출)
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<BannerResponseDTO> toggleBannerStatus(@PathVariable Long id) {
        log.info("배너 상태 토글 요청 - id: {}", id);
        
        BannerResponseDTO updatedBanner = bannerService.toggleBannerStatus(id);
        return ResponseEntity.ok(updatedBanner);
    }

    /**
     * 배너 순서 변경 (간단한 방식)
     */
    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderBanners(@RequestBody List<BannerService.ReorderRequest> orderRequests) {
        log.info("배너 순서 변경 요청 - count: {}", orderRequests.size());
        
        bannerService.reorderBanners(orderRequests);
        return ResponseEntity.ok().build();
    }

    /**
     * 일괄 배너 업데이트 (간단한 방식)
     */
    @PostMapping("/bulk")
    public ResponseEntity<Void> bulkUpdateBanners(@RequestBody List<BannerService.BulkUpdateRequest> bulkRequests) {
        log.info("일괄 배너 업데이트 요청 - count: {}", bulkRequests.size());
        
        bannerService.bulkUpdateBanners(bulkRequests);
        return ResponseEntity.ok().build();
    }

    /**
     * 배너 통계 조회 (간단한 방식)
     */
    @GetMapping("/stats")
    public ResponseEntity<BannerService.BannerStats> getBannerStats() {
        log.info("배너 통계 조회 요청");
        
        BannerService.BannerStats stats = bannerService.getBannerStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 배너 클릭/노출 통계 업데이트 (간단한 방식)
     */
    @PostMapping("/{id}/stats")
    public ResponseEntity<Void> updateBannerStats(
            @PathVariable Long id, 
            @RequestParam String type) {
        log.info("배너 통계 업데이트 요청 - id: {}, type: {}", id, type);
        
        bannerService.updateBannerStats(id, type);
        return ResponseEntity.ok().build();
    }

    /**
     * 배너 데이터 내보내기
     */
    @GetMapping("/export")
    public ResponseEntity<String> exportBanners(@RequestParam(defaultValue = "json") String format) {
        log.info("배너 데이터 내보내기 요청 - format: {}", format);
        
        String exportData = bannerService.exportBanners(format);
        return ResponseEntity.ok(exportData);
    }
}
