package com.gpt.squirrelLogistics.service.driverSearch;

import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchRequestDTO;
import com.gpt.squirrelLogistics.dto.driverSearch.DriverSearchResponseDTO;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriverSearchServiceImpl implements DriverSearchService {
    
    private final DriverRepository driverRepository;
    private final CarRepository carRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ReviewRepository reviewRepository;
    
    @Override
    public List<DriverSearchResponseDTO> searchDrivers(DriverSearchRequestDTO request) {
        // 1. 기본 드라이버 목록 조회
        List<Driver> drivers = driverRepository.findAll();
        
        // 2. 각 드라이버에 대한 상세 정보 조회 및 DTO 변환
        List<DriverSearchResponseDTO> results = drivers.stream()
            .map(driver -> buildDriverSearchResponse(driver, request))
            .filter(dto -> dto != null) // null인 경우 필터링
            .collect(Collectors.toList());
        
        // 3. 키워드 검색 적용
        results = applyKeywordSearch(results, request);
        
        // 4. 필터링 적용
        results = applyFilters(results, request);
        
        // 5. 정렬 적용
        results = applySorting(results, request);
        
        return results;
    }
    
    private DriverSearchResponseDTO buildDriverSearchResponse(Driver driver, DriverSearchRequestDTO request) {
        try {
            // 드라이버의 차량 정보 조회 (List로 받아서 첫 번째 차량 사용)
            List<Car> cars = carRepository.findByDriverDriverId(driver.getDriverId());
            if (cars.isEmpty()) return null;
            
            Car car = cars.get(0); // 첫 번째 차량 사용
            
            // 차량 종류 정보 조회
            VehicleType vehicleType = car.getVehicleType();
            if (vehicleType == null) return null;
            
            // 리뷰 평균 평점 계산
            Double averageRating = calculateAverageRating(driver.getDriverId());
            
            return DriverSearchResponseDTO.builder()
                .driverId(driver.getDriverId())
                .mainLoca(driver.getMainLoca())
                .drivable(driver.isDrivable()) // boolean 필드는 is로 시작하는 메서드 사용
                .profileImageUrl(driver.getProfileImageUrl())
                .vehicleTypeId(vehicleType.getVehicleTypeId())
                .vehicleTypeName(vehicleType.getName())
                .maxWeight(vehicleType.getMaxWeight())
                .insurance(car.isInsurance()) // boolean 메서드 호출
                .averageRating(averageRating)
                .latitude(null) // Driver 엔티티에 좌표 필드가 없음
                .longitude(null) // Driver 엔티티에 좌표 필드가 없음
                .build();
                
        } catch (Exception e) {
            // 에러 발생 시 해당 드라이버는 제외
            return null;
        }
    }
    
    private Double calculateAverageRating(Long driverId) {
        List<Review> reviews = reviewRepository.findByDriverId(driverId);
        if (reviews.isEmpty()) return 0.0;
        
        double sum = reviews.stream()
            .mapToDouble(review -> review.getRating()) // int는 null이 될 수 없음
            .sum();
        
        return sum / reviews.size();
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
        return results.stream()
            .filter(dto -> {
                // 즉시 배차 필터
                if (request.getIsImmediate() != null && request.getIsImmediate()) {
                    if (!Boolean.TRUE.equals(dto.getDrivable())) {
                        return false;
                    }
                }
                
                // 최대 적재량 필터
                if (request.getMaxWeight() != null) {
                    if (dto.getMaxWeight() == null || dto.getMaxWeight() < request.getMaxWeight()) {
                        return false;
                    }
                }
                
                // 차량 종류 필터
                if (request.getVehicleTypeId() != null) {
                    if (!request.getVehicleTypeId().equals(dto.getVehicleTypeId())) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
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
            results.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
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
