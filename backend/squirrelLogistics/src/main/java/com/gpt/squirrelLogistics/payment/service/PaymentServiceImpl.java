package com.gpt.squirrelLogistics.payment.service;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.payment.dto.PaymentDTO;
import com.gpt.squirrelLogistics.payment.repository.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	
	private final PaymentRepository paymentRepository;
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
