package com.gpt.squirrelLogistics.service.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchResponseDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchPageResponseDTO;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.OptionalInt;

/**
 * 기사 검색 서비스 구현체
 * 
 * 주요 기능:
 * 1. 기사 검색 (필터링, 정렬, 페이징)
 * 2. 즉시 배차 가능 기사 필터링 (Driver.drivable = true)
 * 3. 최대 적재량 필터링 (VehicleType.maxWeight >= 요청 무게)
 * 4. 차량 종류 필터링 (VehicleType.vehicleTypeId 매칭)
 * 5. 별점순 정렬 (Review 테이블 평균 평점)
 * 6. 거리순 정렬 (주소 좌표 기반 거리 계산)
 * 7. 10개씩 페이징 처리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriverSearchServiceImpl implements DriverSearchService {
    
    // Repository 의존성 주입
    private final UserRepository userRepository;           // 사용자 정보 조회
    private final DriverRepository driverRepository;       // 기사 정보 조회
    private final CarRepository carRepository;             // 차량 정보 조회
    private final VehicleTypeRepository vehicleTypeRepository; // 차량 종류 정보 조회
    private final ReviewRepository reviewRepository;       // 리뷰 정보 조회
    
    // 리뷰 평점 캐시 (메모리 기반, 성능 향상용)
    private final Map<Long, Double> ratingCache = new ConcurrentHashMap<>();
    
    /**
     * 메인 기사 검색 메서드
     * 요구사항: 모든 기사 리스트 → 필터링 → 정렬 → 페이징
     */
    @Override
    public DriverSearchPageResponseDTO searchDrivers(DriverSearchRequestDTO request) {
        System.out.println("=== 기사 검색 시작 ===");
        System.out.println("요청 파라미터: " + request);
        
        try {
            // 1. 페이징 정보 설정 (기본값: 0페이지, 10개씩)
            int page = request.getPage() != null ? request.getPage() : 0;
            int size = request.getSize() != null ? request.getSize() : 10;
            
            // 2. findDriverList()를 사용하여 기사 정보 조회 (프로필 이미지 포함)
            List<Object[]> allDriverList = driverRepository.findDriverList();
            System.out.println("전체 Driver 정보: " + allDriverList.size() + "명");
            
            if (allDriverList.isEmpty()) {
                System.out.println("경고: Driver 정보가 없습니다!");
                return createEmptyResponse(page, size);
            }
            
            // 3. Driver 정보로 변환 (DTO 변환 및 기본 필터링)
            List<DriverSearchResponseDTO> allResults = allDriverList.stream()
                .map(driverList -> buildDriverSearchResponseFromList(driverList, request))
                .filter(dto -> dto != null)  // null인 경우 제외
                .collect(Collectors.toList());
            System.out.println("Driver 정보 변환 후: " + allResults.size() + "명");
            
            if (allResults.isEmpty()) {
                System.out.println("경고: Driver 정보 변환 결과가 없습니다!");
                return createEmptyResponse(page, size);
            }
            
            // 3-1. 같은 driver_id를 가진 항목들을 하나로 합치기
            allResults = mergeDriverVehicles(allResults);
            
            // 4. 키워드 검색 적용 (기사명, 연락처, 지역 등)
            allResults = applyKeywordSearch(allResults, request);
            System.out.println("키워드 검색 후: " + allResults.size() + "명");
            
            // 5. 필터링 적용 (즉시 배차, 최대 적재량, 차량 종류)
            allResults = applyFilters(allResults, request);
            System.out.println("필터링 후: " + allResults.size() + "명");
            
            // 6. 정렬 적용 (별점순, 거리순)
            allResults = applySorting(allResults, request);
            
            // 7. 수동 페이징 적용 (10개씩)
            int totalElements = allResults.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            List<DriverSearchResponseDTO> pageResults;
            if (totalElements == 0) {
                // 필터링 결과가 0개인 경우 빈 배열 반환
                pageResults = new ArrayList<>();
            } else {
                int startIndex = page * size;
                int endIndex = Math.min(startIndex + size, totalElements);
                pageResults = allResults.subList(startIndex, endIndex);
            }
            
            System.out.println("=== 최종 결과 ===");
            System.out.println("현재 페이지 기사 수: " + pageResults.size());
            System.out.println("필터링된 총 기사 수: " + totalElements);
            System.out.println("필터링된 총 페이지 수: " + totalPages);
            System.out.println("=== 기사 검색 완료 ===");
            
            // 8. 페이징된 결과 반환
            return DriverSearchPageResponseDTO.builder()
                .drivers(pageResults)
                .currentPage(page)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .pageSize(size)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
                
        } catch (Exception e) {
            System.err.println("기사 검색 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return createEmptyResponse(0, 10);
        }
    }
    
    /**
     * 같은 driver_id를 가진 항목들을 하나로 합치기
     * 하나의 기사가 여러 차량을 가질 수 있으므로 차량 정보만 합침
     */
    private List<DriverSearchResponseDTO> mergeDriverVehicles(List<DriverSearchResponseDTO> drivers) {
        // driver_id별로 그룹화
        Map<Long, List<DriverSearchResponseDTO>> driverGroups = drivers.stream()
            .collect(Collectors.groupingBy(DriverSearchResponseDTO::getDriverId));
        
        // 각 그룹을 하나의 DTO로 합치기
        List<DriverSearchResponseDTO> mergedDrivers = driverGroups.values().stream()
            .map(group -> mergeDriverGroup(group))
            .filter(dto -> dto != null)  // null인 경우 제외
            .collect(Collectors.toList());
        
        return mergedDrivers;
    }
    
    /**
     * 하나의 driver_id 그룹을 하나의 DTO로 합치기
     * 차량 정보만 합치고 나머지는 첫 번째 항목 기준으로 설정
     */
    private DriverSearchResponseDTO mergeDriverGroup(List<DriverSearchResponseDTO> group) {
        if (group.isEmpty()) {
            return null;
        }
        
        // 첫 번째 항목을 기본으로 사용
        DriverSearchResponseDTO base = group.get(0);
        
        // 차량 정보들을 수집 (차량종류만)
        List<String> vehicleTypes = group.stream()
            .filter(driver -> driver.getVehicleTypeName() != null)
            .map(driver -> driver.getVehicleTypeName())
            .distinct()  // 중복 제거
            .collect(Collectors.toList());
        
        // combinedVehicleInfo 생성 - 차량종류만 쉼표로 구분하여 나열
        String combinedInfo = vehicleTypes.isEmpty() ? "정보 없음" : String.join(", ", vehicleTypes);
        
        // 보험 정보는 하나라도 true면 true
        boolean hasInsurance = group.stream()
            .anyMatch(driver -> driver.getInsurance() != null && driver.getInsurance());
        
        // 최대 적재량은 가장 큰 값으로 설정 (모든 차량 중 최대값)
        Integer maxWeight = null;
        OptionalInt maxWeightOpt = group.stream()
            .filter(driver -> driver.getMaxWeight() != null)
            .mapToInt(DriverSearchResponseDTO::getMaxWeight)
            .max();
        if (maxWeightOpt.isPresent()) {
            maxWeight = maxWeightOpt.getAsInt();
        }
        
        // maxCombinedWeight 생성 - 가장 큰 최대적재량을 포맷팅
        String maxCombinedWeight = maxWeight != null ? formatMaxWeight(maxWeight) : "정보 없음";
        
        // 새로운 DTO 생성
        return DriverSearchResponseDTO.builder()
            .driverId(base.getDriverId())
            .driverName(base.getDriverName())
            .mainLoca(base.getMainLoca())
            .drivable(base.getDrivable())
            .profileImageUrl(base.getProfileImageUrl())
            .vehicleTypeId(base.getVehicleTypeId())
            .vehicleTypeName(base.getVehicleTypeName())
            .maxWeight(maxWeight)  // 가장 큰 최대적재량
            .insurance(hasInsurance)
            .averageRating(base.getAverageRating())
            .latitude(base.getLatitude())
            .longitude(base.getLongitude())
            .combinedVehicleInfo(combinedInfo)  // 차량종류만 쉼표로 구분
            .maxCombinedWeight(maxCombinedWeight)  // 가장 큰 최대적재량
            .build();
    }
    
    /**
     * 최대 적재량을 읽기 쉬운 형태로 포맷팅
     */
    private String formatMaxWeight(Integer maxWeight) {
        if (maxWeight == null) {
            return "정보 없음";
        }
        
        if (maxWeight >= 1000) {
            return (maxWeight / 1000) + "톤";
        } else {
            return maxWeight + "kg";
        }
    }
    
    /**
     * 빈 응답 생성 (에러 시 사용)
     */
    private DriverSearchPageResponseDTO createEmptyResponse(int page, int size) {
        return DriverSearchPageResponseDTO.builder()
            .drivers(new ArrayList<>())
            .currentPage(page)
            .totalPages(0)
            .totalElements(0)
            .pageSize(size)
            .hasNext(false)
            .hasPrevious(false)
            .build();
    }
    
    /**
     * findDriverList() 결과를 기사 검색 응답 DTO로 변환
     * 
     * driverList 배열 구조:
     * [0: driverId, 1: driverName, 2: profileImageUrl, 3: vehicleTypeName, 4: maxWeight, 5: mainLoca, 6: drivable, 7: insurance]
     * 
     * @param driverList findDriverList() 결과 배열
     * @param request 검색 요청 DTO
     * @return 기사 검색 응답 DTO
     */
    private DriverSearchResponseDTO buildDriverSearchResponseFromList(Object[] driverList, DriverSearchRequestDTO request) {
        try {
            // 1. 배열에서 데이터 추출
            Long driverId = ((Number) driverList[0]).longValue();
            String driverName = (String) driverList[1];
            String profileImageUrl = (String) driverList[2];
            String vehicleTypeName = (String) driverList[3];
            Integer maxWeight = ((Number) driverList[4]).intValue();
            String mainLoca = (String) driverList[5];
            Boolean drivable = (Boolean) driverList[6];
            Boolean insurance = (Boolean) driverList[7];
            
            // 2. 프로필 이미지 URL 처리 (DeliveryAssignmentService와 동일한 방식)
            String fileName = "default_profile.png";
            if (profileImageUrl != null && !profileImageUrl.equals("") && !profileImageUrl.equals("null")) {
                String path = profileImageUrl;
                fileName = path.substring(path.lastIndexOf("/") + 1);
            }
            
            // 3. 리뷰 평균 평점 계산 (캐시된 값 사용)
            Double averageRating = getCachedAverageRating(driverId);
            
            // 4. 디버깅 정보
            System.out.println("Driver " + driverId + " - DB에서 가져온 drivable: " + drivable + " (타입: " + (drivable != null ? drivable.getClass().getSimpleName() : "null") + ")");
            System.out.println("Driver " + driverId + " - 원본 profileImageUrl: '" + profileImageUrl + "' (타입: " + (profileImageUrl != null ? profileImageUrl.getClass().getSimpleName() : "null") + ")");
            System.out.println("Driver " + driverId + " - 추출된 fileName: " + fileName);
            System.out.println("Driver " + driverId + " - 최종 profileImageUrl: " + "/api/public/driverImage/" + fileName);
            
            // 5. DTO 빌더로 응답 객체 생성
            return DriverSearchResponseDTO.builder()
                .driverId(driverId)
                .driverName(driverName)
                .mainLoca(mainLoca)
                .drivable(drivable)
                .profileImageUrl("/api/public/driverImage/" + fileName) 
                .vehicleTypeId(null)  // findDriverList에서 vehicleTypeId는 조회하지 않으므로 null
                .vehicleTypeName(vehicleTypeName)
                .maxWeight(maxWeight)
                .insurance(insurance)
                .averageRating(averageRating)
                .latitude(null)  // 좌표 정보는 별도로 관리 필요
                .longitude(null) // 좌표 정보는 별도로 관리 필요
                .combinedVehicleInfo(vehicleTypeName != null ? vehicleTypeName : "정보 없음")
                .maxCombinedWeight(maxWeight != null ? formatMaxWeight(maxWeight) : "정보 없음")
                .build();
                
        } catch (Exception e) {
            // 에러 발생 시 해당 사용자는 제외
            System.out.println("Error building response from driverList: " + e.getMessage());
            return null;
        }
    }
    

    
    /**
     * 리뷰 평점 캐시에서 평균 평점 조회
     * 성능 향상을 위해 메모리 캐시 사용
     * 
     * @param driverId 기사 ID
     * @return 평균 평점 (0.0 ~ 5.0)
     */
    private Double getCachedAverageRating(Long driverId) {
        return ratingCache.computeIfAbsent(driverId, this::calculateAverageRating);
    }
    
    /**
     * 기사의 평균 평점 계산
     * Review 테이블에서 해당 기사의 모든 리뷰를 조회하여 평균 계산
     * 
     * @param driverId 기사 ID
     * @return 평균 평점 (리뷰가 없으면 0.0)
     */
    private Double calculateAverageRating(Long driverId) {
        List<Review> reviews = reviewRepository.findByDriverId(driverId);
        if (reviews.isEmpty()) {
            System.out.println("Driver " + driverId + " - 리뷰 없음, 평점: 0.0");
            return 0.0;
        }
        
        // 모든 리뷰의 평점을 합산하여 평균 계산
        double sum = reviews.stream()
            .mapToDouble(review -> review.getRating()) // int는 null이 될 수 없음
            .sum();
        
        double average = sum / reviews.size();
        System.out.println("Driver " + driverId + " - 리뷰 " + reviews.size() + "개, 총점: " + sum + ", 평균: " + average);
        
        return average;
    }
    
    /**
     * 키워드 검색 적용
     * 차량 종류명, 선호 지역 등에서 키워드 검색
     * 
     * @param results 검색 대상 기사 목록
     * @param request 검색 요청 DTO
     * @return 키워드 검색 결과
     */
    private List<DriverSearchResponseDTO> applyKeywordSearch(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        if (request.getKeyword() == null || request.getKeyword().trim().isEmpty()) {
            return results;
        }
        
        String keyword = request.getKeyword().toLowerCase().trim();
        
        return results.stream()
            .filter(dto -> {
                // 기사 이름으로 검색(김도경 추가)
                if (dto.getDriverName() != null && dto.getDriverName().toLowerCase().contains(keyword)) {
                    return true;
                }
                
                // 차량 종류로 검색
                if (dto.getVehicleTypeName() != null && dto.getVehicleTypeName().toLowerCase().contains(keyword)) {
                    return true;
                }
                
                // 선호 지역으로 검색
                if (dto.getMainLoca() != null && dto.getMainLoca().toLowerCase().contains(keyword)) {
                    return true;
                }
                
                return false;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 필터링 적용
     * 
     * 필터 조건:
     * 1. 즉시 배차: Driver.drivable = true인 기사만
     * 2. 최대 적재량: VehicleType.maxWeight >= 요청 무게
     * 3. 차량 종류: VehicleType.vehicleTypeId = 요청 vehicleTypeId
     * 
     * @param results 필터링 대상 기사 목록
     * @param request 검색 요청 DTO
     * @return 필터링된 기사 목록
     */
    private List<DriverSearchResponseDTO> applyFilters(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        System.out.println("=== 필터링 시작 ===");
        System.out.println("필터링 전 기사 수: " + results.size());
        System.out.println("요청된 필터 조건:");
        System.out.println("  - 즉시 배차: " + request.getDrivable());
        System.out.println("  - 최대 적재량: " + request.getMaxWeight() + " kg");
        System.out.println("  - 차량 종류 ID: " + request.getVehicleTypeId());
        
        // 각 기사의 상세 정보 확인 (디버깅용)
        System.out.println("=== 각 기사의 상세 정보 확인 ===");
        results.forEach(dto -> {
            System.out.println("기사 " + dto.getDriverId() + 
                " - drivable: " + dto.getDrivable() + 
                ", maxWeight: " + dto.getMaxWeight() + " kg" +
                ", vehicleTypeId: " + dto.getVehicleTypeId() +
                ", vehicleTypeName: " + dto.getVehicleTypeName());
        });
        
        List<DriverSearchResponseDTO> filteredResults = results.stream()
            .filter(dto -> {
                // 1. 즉시 배차 필터 (MySQL의 1/0 값 처리)
                if (request.getDrivable() != null && request.getDrivable()) {
                    System.out.println("기사 " + dto.getDriverId() + " 즉시 배차 필터 검사 - 기사 drivable: " + dto.getDrivable());
                    // drivable이 1(true)인 경우만 즉시 배차 가능
                    if (dto.getDrivable() == null || !dto.getDrivable()) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 즉시 배차 불가 (drivable: " + dto.getDrivable() + ")");
                        return false;
                    }
                    System.out.println("기사 " + dto.getDriverId() + " 즉시 배차 필터 통과");
                }
                
                // 2. 최대 적재량 필터 (VehicleType.maxWeight >= 요청 무게)
                if (request.getMaxWeight() != null) {
                    System.out.println("기사 " + dto.getDriverId() + " 최대 적재량 필터 검사 - 기사: " + dto.getMaxWeight() + " kg, 요청: " + request.getMaxWeight() + " kg");
                    if (dto.getMaxWeight() == null || dto.getMaxWeight() < request.getMaxWeight()) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 최대 적재량 부족 (기사: " + dto.getMaxWeight() + " kg, 요청: " + request.getMaxWeight() + " kg)");
                        return false;
                    }
                    System.out.println("기사 " + dto.getDriverId() + " 최대 적재량 필터 통과");
                }
                
                // 3. 차량 종류 필터 (VehicleType.vehicleTypeId = 요청 vehicleTypeId)
                if (request.getVehicleTypeId() != null) {
                    System.out.println("기사 " + dto.getDriverId() + " 차량 종류 필터 검사 - 기사: " + dto.getVehicleTypeId() + ", 요청: " + request.getVehicleTypeId());
                    if (!request.getVehicleTypeId().equals(dto.getVehicleTypeId())) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 차량 종류 불일치 (기사: " + dto.getVehicleTypeId() + ", 요청: " + request.getVehicleTypeId() + ")");
                        return false;
                    }
                    System.out.println("기사 " + dto.getDriverId() + " 차량 종류 필터 통과");
                }
                
                System.out.println("기사 " + dto.getDriverId() + " 포함: 모든 필터 조건 통과");
                return true;
            })
            .collect(Collectors.toList());
            
        System.out.println("필터링 후 기사 수: " + filteredResults.size());
        System.out.println("=== 필터링 완료 ===");
        
        return filteredResults;
    }
    
    /**
     * 정렬 적용
     * 
     * 정렬 옵션:
     * 1. distance: 주소 좌표 기반 거리순 정렬 (가까운 순)
     * 2. rating: Review 테이블 평균 평점순 정렬 (높은 순)
     * 
     * @param results 정렬 대상 기사 목록
     * @param request 검색 요청 DTO
     * @return 정렬된 기사 목록
     */
    private List<DriverSearchResponseDTO> applySorting(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        if ("distance".equals(request.getSortOption()) && request.getLatitude() != null && request.getLongitude() != null) {
            // 거리순 정렬 - 좌표가 없는 경우 가장 뒤로 정렬
            System.out.println("거리순 정렬 적용");
            results.sort((a, b) -> {
                // 좌표가 없는 경우 가장 뒤로
                if (a.getLatitude() == null || a.getLongitude() == null) return 1;
                if (b.getLatitude() == null || b.getLongitude() == null) return -1;
                
                // 두 지점 간의 거리 계산하여 비교
                double distanceA = calculateDistance(request.getLatitude(), request.getLongitude(), a.getLatitude(), a.getLongitude());
                double distanceB = calculateDistance(request.getLatitude(), request.getLongitude(), b.getLatitude(), b.getLongitude());
                return Double.compare(distanceA, distanceB); // 가까운 순으로 정렬
            });
        } else if ("rating".equals(request.getSortOption())) {
            // 별점순 정렬 (높은 순)
            System.out.println("별점순 정렬 적용 - 정렬 전:");
            results.forEach(dto -> System.out.println("Driver " + dto.getDriverId() + " - 평점: " + dto.getAverageRating()));
            
            // 평점이 높은 순으로 정렬 (내림차순)
            results.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
            
            System.out.println("별점순 정렬 적용 - 정렬 후:");
            results.forEach(dto -> System.out.println("Driver " + dto.getDriverId() + " - 평점: " + dto.getAverageRating()));
        }
        
        return results;
    }
    
    /**
     * 두 지점 간의 거리 계산 (Haversine 공식 사용)
     * 
     * @param lat1 첫 번째 지점 위도
     * @param lng1 첫 번째 지점 경도
     * @param lat2 두 번째 지점 위도
     * @param lng2 두 번째 지점 경도
     * @return 두 지점 간의 거리 (km)
     */
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        if (lat1 == 0 || lng1 == 0 || lat2 == 0 || lng2 == 0) {
            return Double.MAX_VALUE; // 좌표가 0이면 가장 뒤로
        }
        
        final double R = 6371; // 지구 반지름 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        // Haversine 공식
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    /**
     * 기사 통계 정보 조회
     * 
     * @return 기사 통계 정보
     */
    @Override
    public Object getDriverStats() {
        try {
            // 전체 기사 수
            long totalDrivers = userRepository.countByRole(UserRoleEnum.DRIVER);
            
            // 즉시 배차 가능한 기사 수
            long drivableDrivers = driverRepository.countByDrivableTrue();
            
            // 통계 정보를 Map으로 반환
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDrivers", totalDrivers);
            stats.put("drivableDrivers", drivableDrivers);
            stats.put("drivablePercentage", totalDrivers > 0 ? (double) drivableDrivers / totalDrivers * 100 : 0);
            
            return stats;
        } catch (Exception e) {
            System.out.println("기사 통계 조회 실패: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * 기사 검색 히스토리 저장
     * 
     * @param request 검색 요청 DTO
     * @return 저장 결과
     */
    @Override
    public Object saveSearchHistory(DriverSearchRequestDTO request) {
        try {
            // 실제 구현에서는 검색 히스토리를 DB에 저장
            // 현재는 성공 응답만 반환
            Map<String, Object> result = new HashMap<>();
            result.put("message", "검색 히스토리가 저장되었습니다.");
            result.put("timestamp", System.currentTimeMillis());
            result.put("searchParams", request);
            
            return result;
        } catch (Exception e) {
            System.out.println("검색 히스토리 저장 실패: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * 위치 기반 기사 검색
     * 
     * @param request 검색 요청 DTO (latitude, longitude 포함)
     * @return 위치 기반 검색 결과
     */
    @Override
    public Object searchDriversByLocation(DriverSearchRequestDTO request) {
        try {
            if (request.getLatitude() == null || request.getLongitude() == null) {
                throw new IllegalArgumentException("위도와 경도가 필요합니다.");
            }
            
            // 위치 기반 검색을 위해 별도 메서드 호출
            DriverSearchPageResponseDTO results = searchDrivers(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "위치 기반 검색이 완료되었습니다.");
            result.put("searchResults", results);
            result.put("searchLocation", Map.of(
                "latitude", request.getLatitude(),
                "longitude", request.getLongitude()
            ));
            
            return result;
        } catch (Exception e) {
            System.out.println("위치 기반 기사 검색 실패: " + e.getMessage());
            return null;
        }
    }
}
