package com.gpt.squirrelLogistics.dto.driverSearch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 기사 검색 응답 DTO
 * 프론트엔드로 전송되는 기사 정보를 담는 객체
 * 여러 엔티티의 정보를 조합하여 구성
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverSearchResponseDTO {
    // Driver에서 가져올 정보
    private Long driverId;            // 기사 ID (Primary Key)
    private String driverName;        // 기사 이름 (User 엔티티에서 가져옴)
    private String mainLoca;          // 선호 지역 (Driver 엔티티에서 가져옴)
    private Boolean drivable;         // 즉시 배차 가능 여부 (Driver 엔티티에서 가져옴)
    private String profileImageUrl;   // 프로필 이미지 URL (현재는 null)
    
    // VehicleType에서 가져올 정보 (Car를 통해 조인)
    private Long vehicleTypeId;       // 차량 종류 ID (Primary Key)
    private String vehicleTypeName;   // 차량 종류 이름 (예: "1톤 트럭", "5톤 트럭")
    private Integer maxWeight;        // 최대 적재량 (kg 단위)
    
    // Car에서 가져올 정보
    private Boolean insurance;        // 보험 여부 (Car 엔티티에서 가져옴)
    
    // Review에서 계산된 평균 평점
    private Double averageRating;     // 평균 평점 (0.0 ~ 5.0, 리뷰가 없으면 0.0)
    
    // 거리 계산을 위한 좌표 (선택사항, 현재는 null)
    private Double latitude;          // 위도 (거리순 정렬 시 사용)
    private Double longitude;         // 경도 (거리순 정렬 시 사용)
}
