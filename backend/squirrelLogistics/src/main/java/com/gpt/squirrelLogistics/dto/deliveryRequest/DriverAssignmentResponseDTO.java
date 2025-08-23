package com.gpt.squirrelLogistics.dto.deliveryRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAssignmentResponseDTO {
    // DeliveryRequest 정보
    private Long requestId;
    private String startAddress;
    private String endAddress;
    private Long estimatedFee;
    
    // Driver 정보
    private Long driverId;
    private String mainLoca;
    private Boolean drivable;
    
    // Car 정보
    private Long carId;
    private String carNum;
    private Boolean isInsurance;
    
    // VehicleType 정보
    private Long vehicleTypeId;
    private String vehicleTypeName;
    private Integer maxWeight;
    
    // User 정보 (기사 이름)
    private Long userId;
    private String driverName;
}
