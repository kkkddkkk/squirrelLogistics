package com.gpt.squirrelLogistics.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, String> {

}
