package com.gpt.squirrelLogistics.service.payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;
import com.gpt.squirrelLogistics.enums.review.StateEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	private final PaymentRepository paymentRepository;
	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;

	private final DeliveryAssignmentService deliveryAssignmentService;

	@Override
	public Long registerPayment(PaymentDTO paymentDTO) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public PaymentDTO getPayment(Long paymentId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Long trySecondPayment(PaymentDTO paymentDTO) {

		Payment payment = Payment.builder().prepaidId(paymentDTO.getPaymentId()).settlement(false)
				.payStatus(PayStatusEnum.PENDING).build();
		return paymentRepository.save(payment).getPaymentId();
	}

	@Override
	public PayBoxDTO getSecondPayBox(Long prepaidId) {

		Long paymentId = paymentRepository.findPaymentIdByPrepaidId(prepaidId);

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findDeliveryAssignmentById(prepaidId);

		ActualCalcDTO actualCalcDTO = deliveryAssignmentService.getActualCalc(deliveryAssignment.getAssignedId());
		PayBoxDTO payBoxDTO = PayBoxDTO.builder().requestId(actualCalcDTO.getRequestId()).paymentId(paymentId)
				.prepaidId(prepaidId).dropOrder1(actualCalcDTO.isDropOrder1()).dropOrder2(actualCalcDTO.isDropOrder2())
				.dropOrder3(actualCalcDTO.isDropOrder3()).distance(actualCalcDTO.getDistance())
				.weight(actualCalcDTO.getWeight()).caution(actualCalcDTO.isCaution())
				.mountainous(actualCalcDTO.isMountainous()).estimateFee(actualCalcDTO.getEstimateFee()).build();

		return payBoxDTO;
	}

	@Transactional
	@Override
	public void processingsecondPayment(TryPaymentDTO tryPaymentDTO) {
		Payment payment = paymentRepository.findById(tryPaymentDTO.getPaymentId()).orElseThrow();

		payment.setPayMethod(tryPaymentDTO.getPayMethod());
		payment.setPayAmount(tryPaymentDTO.getPayAmount());
		payment.setPayStatus(PayStatusEnum.PROCESSING);

	}

	@Transactional
	@Override
	public void successSecondPayment(PaymentSuccessDTO paymentSuccessDTO) {
		Payment payment = paymentRepository.findById(paymentSuccessDTO.getPaymentId()).orElseThrow();

		payment.setPayStatus(PayStatusEnum.COMPLETED);
		payment.setPaid(LocalDateTime.now());

	}

	@Transactional
	@Override
	public void failureSecondPayment(PaymentFailureDTO paymentFailureDTO) {
		Payment payment = paymentRepository.findById(paymentFailureDTO.getPaymentId()).orElseThrow();

		payment.setPayStatus(PayStatusEnum.FAILED);
		payment.setPaid(LocalDateTime.now());

	}

}
