package com.gpt.squirrelLogistics.controller.payment;

import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.review.ReviewController;
import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.payment.PaymentService;
import com.gpt.squirrelLogistics.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/payment")
public class PaymentController {
	private final PaymentRepository paymentRepository;
	private final PaymentService paymentService;
	
    @PostMapping
    public Map<String, Long> createReview(@RequestBody PaymentDTO paymentDTO ) {
//    	Long reviewId = reviewService.regiReview(reviewDTO);

        return null;
    }
    
    //2차 결제 payment row 생성
    @PostMapping("/secondTry/{paymentId}")
    public Map<String, Long> trySecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentDTO paymentDTO ) {
    	paymentDTO.setPaymentId(paymentId);
    	Long secondPaymentId =  paymentService.trySecondPayment(paymentDTO);

        return Map.of("secondPaymentId", secondPaymentId);
    }
    
    //2차 결제창 랜더링
    @GetMapping("/second/{prepaidId}")
    public PayBoxDTO getSecondPayBox(@PathVariable(name="prepaidId") Long prepaidId) {
    	PayBoxDTO payBoxDTO = paymentService.getSecondPayBox(prepaidId);
    	return payBoxDTO;
    }
    
    //2차 결제 시도
    @PutMapping("/second/{paymentId}")
    public Map<String, Long> processingsecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody TryPaymentDTO tryPaymentDTO ) {
    	tryPaymentDTO.setPaymentId(paymentId);
    	paymentService.processingsecondPayment(tryPaymentDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //2차결제성공
    @PutMapping("/second/{paymentId}/success")
    public Map<String, Long> successSecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentSuccessDTO paymentSuccessDTO ) {
    	paymentSuccessDTO.setPaymentId(paymentId);
    	paymentService.successSecondPayment(paymentSuccessDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //2차결제실패
    @PutMapping("/second/{paymentId}/failure")
    public Map<String, Long> failureSecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentFailureDTO paymentFailureDTO ) {
    	paymentFailureDTO.setPaymentId(paymentId);
    	paymentService.failureSecondPayment(paymentFailureDTO);

        return Map.of("paymentId", paymentId);
    }
    
    
}
