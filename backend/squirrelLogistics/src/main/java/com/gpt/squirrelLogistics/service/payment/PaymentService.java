package com.gpt.squirrelLogistics.service.payment;


import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.config.PaymentConfig;

import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.RecieptDTO;
import com.gpt.squirrelLogistics.dto.payment.RefundDTO;
import com.gpt.squirrelLogistics.dto.payment.TransactionStatementDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;

@Service
public interface PaymentService {
	Long registerPayment(PaymentDTO paymentDTO);
	
	PaymentDTO getPayment(Long paymentId);
	
	//1차결제 시도
	Long tryFirstPayment(PaymentDTO paymentDTO);
	
	//1차 결제 페이지 랜더링
	PayBoxDTO getFirstPayBox(Long paymentId);
	
	//2차결제 시도
	Long trySecondPayment(PaymentDTO paymentDTO);
	
	//2차 결제 페이지 랜더링
	PayBoxDTO getSecondPayBox(Long prepaid);
	
	//1차 결제 성공 시
	void successFirstPayment(PaymentSuccessDTO paymentSuccessDTO);
	
	//2차 결제 생공 시
	void successSecondPayment(PaymentSuccessDTO paymentSuccessDTO);
	
	//2차 결제 환불 시
	void successRefundPayment(RefundDTO refundDTO);
	
	//2차 결제 실패 시
	void failureSecondPayment(PaymentFailureDTO paymentFailureDTO);
	
	//결제 방법에 따른 계정 정보 검증
	PaymentConfig.PaymentAccountInfo getPaymentAccountInfo(String payMethod);
	
	//결제 검증을 위한 로깅 및 계정 정보 확인
	void logPaymentAccountInfo(String payMethod, String impUid);
	
	
	//영수증 랜더링
	RecieptDTO getReciept(Long paymentId);
	
	//거래명세서 랜더링
	TransactionStatementDTO getTransaction(Long paymentId);

}
