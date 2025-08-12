package com.gpt.squirrelLogistics.repository.deliveryRequest;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {

}
