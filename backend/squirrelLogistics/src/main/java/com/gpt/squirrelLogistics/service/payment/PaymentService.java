package com.gpt.squirrelLogistics.service.payment;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;

@Service
public interface PaymentService {
	Long registerPayment(PaymentDTO paymentDTO);
	
	PaymentDTO getPayment(Long paymentId);
	
	//2차결제 시도
	Long trySecondPayment(PaymentDTO paymentDTO);
	
	//결제 페이지 랜더링
	PayBoxDTO getSecondPayBox(Long prepaid);
	
	//2차 결제
	void processingsecondPayment(TryPaymentDTO tryPaymentDTO);
	
	void successSecondPayment(PaymentSuccessDTO paymentSuccessDTO);
	
	void failureSecondPayment(PaymentFailureDTO paymentFailureDTO);

}
