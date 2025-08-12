package com.gpt.squirrelLogistics.service.payment;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	//private final PaymentRepository paymentRepository;
	//private final ModelMapper modelMapper;
	@Override
	public Long registerPayment(PaymentDTO paymentDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PaymentDTO getPayment(String paymentId) {
		// TODO Auto-generated method stub
		return null;
	}


}
