package com.gpt.squirrelLogistics.controller.payment;

import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.review.ReviewController;
import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.RecieptDTO;
import com.gpt.squirrelLogistics.dto.payment.RefundDTO;
import com.gpt.squirrelLogistics.dto.payment.TransactionStatementDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.payment.PaymentService;
import com.gpt.squirrelLogistics.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {
	private final PaymentRepository paymentRepository;
	private final PaymentService paymentService;
	
    @PostMapping
    public Map<String, Long> createReview(@RequestBody PaymentDTO paymentDTO ) {
//    	Long reviewId = reviewService.regiReview(reviewDTO);

        return null;
    }
    
    //1차 결제 payment row 생성
    @PostMapping("/firstTry/{paymentId}")
    public Map<String, Long> tryFirstPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentDTO paymentDTO ) {
    	paymentDTO.setPaymentId(paymentId);
    	Long secondPaymentId =  paymentService.tryFirstPayment(paymentDTO);

        return Map.of("secondPaymentId", secondPaymentId);
    }
    
    //1차 결제창 랜더링
    @GetMapping("/first/{paymentId}")
    public PayBoxDTO getFirstPayBox(@PathVariable(name="paymentId") Long paymentId) {
    	PayBoxDTO payBoxDTO = paymentService.getFirstPayBox(paymentId);
    	return payBoxDTO;
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
    
    //1차결제성공
    @PutMapping("/first/{paymentId}/success")
    public Map<String, Long> successFirstPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentSuccessDTO paymentSuccessDTO ) {
    	
    	log.info("DTO in Controller --> " + paymentSuccessDTO);
    	paymentSuccessDTO.setPaymentId(paymentId);
    	paymentService.successFirstPayment(paymentSuccessDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //2차결제성공
    @PutMapping("/second/{paymentId}/success")
    public Map<String, Long> successSecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentSuccessDTO paymentSuccessDTO ) {
    	paymentSuccessDTO.setPaymentId(paymentId);
    	paymentService.successSecondPayment(paymentSuccessDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //환불
    @PutMapping("/refund/{paymentId}/success")
    public Map<String, Long> successRefundPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody RefundDTO refundDTO ) {
    	refundDTO.setPaymentId(paymentId);
    	paymentService.successRefundPayment(refundDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //2차결제실패
    @PutMapping("/second/{paymentId}/failure")
    public Map<String, Long> failureSecondPayment(@PathVariable(name="paymentId") Long paymentId, @RequestBody PaymentFailureDTO paymentFailureDTO ) {
    	paymentFailureDTO.setPaymentId(paymentId);
    	paymentService.failureSecondPayment(paymentFailureDTO);

        return Map.of("paymentId", paymentId);
    }
    
    //영수증
    @GetMapping("/reciept")
    public RecieptDTO getRecipet(@RequestParam(name = "paymentId") Long paymentId ) {

        return paymentService.getReciept(paymentId);
    }
    
    //거래명세서
    @GetMapping("/transactionStatement")
    public TransactionStatementDTO getTransaction(@RequestParam(name="paymentId") Long paymentId) {
    	return paymentService.getTransaction(paymentId);
    }
    
    
}
