package com.gpt.squirrelLogistics.dto.deliveryRequest;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DeliveryRequestCardSlimDTO {

    public Long requestId;
    public LocalDateTime createAt;
    public String startAddress;
    public String endAddress;
    public Long distance;
    public Long estimatedFee;
    public String userName;
    public String vehicleTypeName;
}
