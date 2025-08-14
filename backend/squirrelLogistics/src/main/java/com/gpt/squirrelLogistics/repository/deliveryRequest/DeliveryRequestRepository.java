package com.gpt.squirrelLogistics.repository.deliveryRequest;

import java.sql.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {
	
}
