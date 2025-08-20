package com.gpt.squirrelLogistics.repository.actualDelivery;

import java.sql.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;

public interface ActualDeliveryRepository extends JpaRepository<ActualDelivery, Long> {


}
