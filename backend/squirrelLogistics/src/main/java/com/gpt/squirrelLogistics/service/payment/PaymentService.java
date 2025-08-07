package com.gpt.squirrelLogistics.service.payment;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;

@Service
public interface PaymentService {
	Long registerPayment(PaymentDTO paymentDTO);
	
	PaymentDTO getPayment(String paymentId);

}
