package com.gpt.squirrelLogistics.controller.payment;

import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@Log4j2
@RequiredArgsConstructor
public class PaymentController {
	private final PaymentRepository paymentRepository;

}
