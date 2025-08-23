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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriverSearchServiceImpl implements DriverSearchService {
    
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final CarRepository carRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ReviewRepository reviewRepository;
    
    @Override
    public DriverSearchPageResponseDTO searchDrivers(DriverSearchRequestDTO request) {
        System.out.println("=== 기사 검색 시작 ===");
        System.out.println("요청 파라미터: " + request);
        
        // 1. 페이징 정보 설정
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        
        // 2. 모든 Driver 역할 사용자 조회 (페이징 없이)
        List<User> allDriverUsers = userRepository.findAllByRole(UserRoleEnum.DRIVER);
        System.out.println("전체 Driver 역할 사용자: " + allDriverUsers.size() + "명");
        
        // 3. Driver 정보로 변환
        List<DriverSearchResponseDTO> allResults = allDriverUsers.stream()
            .map(user -> buildDriverSearchResponse(user, request))
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
        System.out.println("Driver 정보 변환 후: " + allResults.size() + "명");
        
        // 4. 키워드 검색 적용
        allResults = applyKeywordSearch(allResults, request);
        System.out.println("키워드 검색 후: " + allResults.size() + "명");
        
        // 5. 필터링 적용
        allResults = applyFilters(allResults, request);
        System.out.println("필터링 후: " + allResults.size() + "명");
        
        // 6. 정렬 적용
        allResults = applySorting(allResults, request);
        
        // 7. 수동 페이징 적용
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
        
        return DriverSearchPageResponseDTO.builder()
            .drivers(pageResults)
            .currentPage(page)
            .totalPages(totalPages)
            .totalElements(totalElements)
            .pageSize(size)
            .hasNext(page < totalPages - 1)
            .hasPrevious(page > 0)
            .build();
    }
    
    private DriverSearchResponseDTO buildDriverSearchResponse(User user, DriverSearchRequestDTO request) {
        try {
            // 사용자 ID로 Driver 엔티티 조회
            Driver driver = driverRepository.findByUserId(user.getUserId());
            if (driver == null) return null;
            
            // Driver의 차량 정보 조회 (List로 받아서 첫 번째 차량 사용)
            List<Car> cars = carRepository.findByDriverDriverId(driver.getDriverId());
            if (cars.isEmpty()) return null;
            
            Car car = cars.get(0); // 첫 번째 차량 사용
            
            // 차량 종류 정보 조회
            VehicleType vehicleType = car.getVehicleType();
            if (vehicleType == null) return null;
            
            // 리뷰 평균 평점 계산 (캐시된 값 사용)
            Double averageRating = getCachedAverageRating(driver.getDriverId());
            
            // drivable 값 디버깅
            Boolean drivableValue = driver.isDrivable();
            System.out.println("Driver " + driver.getDriverId() + " - DB에서 가져온 drivable: " + drivableValue + " (타입: " + (drivableValue != null ? drivableValue.getClass().getSimpleName() : "null") + ")");
            
            return DriverSearchResponseDTO.builder()
                .driverId(driver.getDriverId())
                .driverName(user.getName()) // User 엔티티에서 기사 이름 가져오기
                .mainLoca(driver.getMainLoca()) // Driver 엔티티에서 선호 지역 가져오기
                .drivable(drivableValue) // Driver 엔티티에서 즉시 배차 가능 여부 가져오기
                .profileImageUrl(null) // User 엔티티에 profileImageUrl 필드가 없으므로 null로 설정
                .vehicleTypeId(vehicleType.getVehicleTypeId())
                .vehicleTypeName(vehicleType.getName())
                .maxWeight(vehicleType.getMaxWeight())
                .insurance(car.isInsurance()) // Car 엔티티에서 보험 여부 가져오기
                .averageRating(averageRating)
                .latitude(null) // 좌표 정보는 별도로 관리 필요
                .longitude(null) // 좌표 정보는 별도로 관리 필요
                .build();
                
        } catch (Exception e) {
            // 에러 발생 시 해당 사용자는 제외
            System.out.println("Error building response for user " + user.getUserId() + ": " + e.getMessage());
            return null;
        }
    }
    
    // 리뷰 평점 캐시 (메모리 기반)
    private final Map<Long, Double> ratingCache = new ConcurrentHashMap<>();
    
    private Double getCachedAverageRating(Long driverId) {
        return ratingCache.computeIfAbsent(driverId, this::calculateAverageRating);
    }
    
    private Double calculateAverageRating(Long driverId) {
        List<Review> reviews = reviewRepository.findByDriverId(driverId);
        if (reviews.isEmpty()) {
            System.out.println("Driver " + driverId + " - 리뷰 없음, 평점: 0.0");
            return 0.0;
        }
        
        double sum = reviews.stream()
            .mapToDouble(review -> review.getRating()) // int는 null이 될 수 없음
            .sum();
        
        double average = sum / reviews.size();
        System.out.println("Driver " + driverId + " - 리뷰 " + reviews.size() + "개, 총점: " + sum + ", 평균: " + average);
        
        return average;
    }
    
    private List<DriverSearchResponseDTO> applyKeywordSearch(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        if (request.getKeyword() == null || request.getKeyword().trim().isEmpty()) {
            return results;
        }
        
        String keyword = request.getKeyword().toLowerCase().trim();
        
        return results.stream()
            .filter(dto -> {
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
    
    private List<DriverSearchResponseDTO> applyFilters(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        System.out.println("=== 필터링 시작 ===");
        System.out.println("필터링 전 기사 수: " + results.size());
        System.out.println("요청된 필터 조건:");
        System.out.println("  - 즉시 배차: " + request.getDrivable());
        System.out.println("  - 최대 적재량: " + request.getMaxWeight());
        System.out.println("  - 차량 종류 ID: " + request.getVehicleTypeId());
        
        // 각 기사의 drivable 값 확인
        System.out.println("=== 각 기사의 drivable 값 확인 ===");
        results.forEach(dto -> {
            System.out.println("기사 " + dto.getDriverId() + " - drivable: " + dto.getDrivable() + " (타입: " + (dto.getDrivable() != null ? dto.getDrivable().getClass().getSimpleName() : "null") + ")");
        });
        
        List<DriverSearchResponseDTO> filteredResults = results.stream()
            .filter(dto -> {
                // 즉시 배차 필터 (MySQL의 1/0 값 처리)
                if (request.getDrivable() != null && request.getDrivable()) {
                    // drivable이 1(true)인 경우만 즉시 배차 가능
                    if (dto.getDrivable() == null || !dto.getDrivable()) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 즉시 배차 불가 (drivable: " + dto.getDrivable() + ")");
                        return false;
                    }
                }
                
                // 최대 적재량 필터
                if (request.getMaxWeight() != null) {
                    if (dto.getMaxWeight() == null || dto.getMaxWeight() < request.getMaxWeight()) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 최대 적재량 부족 (기사: " + dto.getMaxWeight() + ", 요청: " + request.getMaxWeight() + ")");
                        return false;
                    }
                }
                
                // 차량 종류 필터
                if (request.getVehicleTypeId() != null) {
                    if (!request.getVehicleTypeId().equals(dto.getVehicleTypeId())) {
                        System.out.println("기사 " + dto.getDriverId() + " 제외: 차량 종류 불일치 (기사: " + dto.getVehicleTypeId() + ", 요청: " + request.getVehicleTypeId() + ")");
                        return false;
                    }
                }
                
                System.out.println("기사 " + dto.getDriverId() + " 포함: 모든 필터 조건 통과");
                return true;
            })
            .collect(Collectors.toList());
            
        System.out.println("필터링 후 기사 수: " + filteredResults.size());
        System.out.println("=== 필터링 완료 ===");
        
        return filteredResults;
    }
    
    private List<DriverSearchResponseDTO> applySorting(List<DriverSearchResponseDTO> results, DriverSearchRequestDTO request) {
        if ("distance".equals(request.getSortOption()) && request.getLatitude() != null && request.getLongitude() != null) {
            // 거리순 정렬 - 좌표가 없는 경우 가장 뒤로 정렬
            results.sort((a, b) -> {
                // 좌표가 없는 경우 가장 뒤로
                if (a.getLatitude() == null || a.getLongitude() == null) return 1;
                if (b.getLatitude() == null || b.getLongitude() == null) return -1;
                
                double distanceA = calculateDistance(request.getLatitude(), request.getLongitude(), a.getLatitude(), a.getLongitude());
                double distanceB = calculateDistance(request.getLatitude(), request.getLongitude(), b.getLatitude(), b.getLongitude());
                return Double.compare(distanceA, distanceB);
            });
        } else if ("rating".equals(request.getSortOption())) {
            // 별점순 정렬 (높은 순)
            System.out.println("별점순 정렬 적용 - 정렬 전:");
            results.forEach(dto -> System.out.println("Driver " + dto.getDriverId() + " - 평점: " + dto.getAverageRating()));
            
            results.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
            
            System.out.println("별점순 정렬 적용 - 정렬 후:");
            results.forEach(dto -> System.out.println("Driver " + dto.getDriverId() + " - 평점: " + dto.getAverageRating()));
        }
        
        return results;
    }
    
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        if (lat1 == 0 || lng1 == 0 || lat2 == 0 || lng2 == 0) {
            return Double.MAX_VALUE; // 좌표가 0이면 가장 뒤로
        }
        
        final double R = 6371; // 지구 반지름 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
