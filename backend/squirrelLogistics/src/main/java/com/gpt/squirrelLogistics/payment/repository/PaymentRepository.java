package com.gpt.squirrelLogistics.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

}
