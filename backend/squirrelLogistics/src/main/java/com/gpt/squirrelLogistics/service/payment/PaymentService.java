package com.gpt.squirrelLogistics.service.payment;

<<<<<<< Updated upstream:backend/squirrelLogistics/src/main/java/com/gpt/squirrelLogistics/payment/service/PaymentService.java
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;

@Service
public interface PaymentService {
	Long registerPayment(PaymentDTO paymentDTO);
	
	PaymentDTO getPayment(String paymentId);
=======
public class PaymentService {
>>>>>>> Stashed changes:backend/squirrelLogistics/src/main/java/com/gpt/squirrelLogistics/service/payment/PaymentService.java

}
