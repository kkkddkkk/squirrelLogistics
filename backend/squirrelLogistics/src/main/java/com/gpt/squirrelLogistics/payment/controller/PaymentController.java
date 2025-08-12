package com.gpt.squirrelLogistics.payment.controller;

import org.springframework.web.bind.annotation.RestController;

<<<<<<< Updated upstream:backend/squirrelLogistics/src/main/java/com/gpt/squirrelLogistics/payment/controller/PaymentController.java
import com.gpt.squirrelLogistics.payment.dto.PaymentDTO;
import com.gpt.squirrelLogistics.payment.service.PaymentService;
=======
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.service.payment.PaymentService;
>>>>>>> Stashed changes:backend/squirrelLogistics/src/main/java/com/gpt/squirrelLogistics/controller/payment/PaymentController.java

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
