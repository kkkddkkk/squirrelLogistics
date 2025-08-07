package com.gpt.squirrelLogistics.payment.service;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.payment.dto.PaymentDTO;

@Service
public interface PaymentService {
	Long registerPayment(PaymentDTO paymentDTO);
	
	PaymentDTO getPayment(String paymentId);

}
