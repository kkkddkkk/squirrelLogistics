package com.gpt.squirrelLogistics.controller.payment;

import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.service.payment.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@Log4j2
@RequiredArgsConstructor
public class PaymentController {

	private final PaymentService paymentService;
	
	@PostMapping("/api/payment/iamport")
	public Map<String, String> tryPayment(@RequestBody PaymentDTO paymentDTO){
		paymentService.registerPayment(paymentDTO);
		return Map.of("result", "결제 성공");
	}
	
}
