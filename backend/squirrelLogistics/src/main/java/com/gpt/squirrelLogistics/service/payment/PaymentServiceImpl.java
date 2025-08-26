package com.gpt.squirrelLogistics.service.payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.payment.PayBoxDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentFailureDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.payment.RecieptDTO;
import com.gpt.squirrelLogistics.dto.payment.RefundDTO;
import com.gpt.squirrelLogistics.dto.payment.TransactionStatementDTO;
import com.gpt.squirrelLogistics.dto.payment.TryPaymentDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;
import com.gpt.squirrelLogistics.enums.review.StateEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointServiceImpl;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

	private final DeliveryWaypointServiceImpl deliveryWaypointServiceImpl;
	private final PaymentRepository paymentRepository;
	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final DeliveryRequestRepository deliveryRequestRepository;

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

	@Override // 1차결제 row 생성
	public Long tryFirstPayment(PaymentDTO paymentDTO) {
		Payment payment = Payment.builder().settlement(false).payStatus(PayStatusEnum.PENDING).build();
		return paymentRepository.save(payment).getPaymentId();
	}

	@Override // 1차 결제창 랜더링
	public PayBoxDTO getFirstPayBox(Long paymentId) {

		Long requestId = deliveryRequestRepository.findIdByPaymentId(paymentId);
		System.out.println("requestID: " + requestId);

		Optional<DeliveryRequest> deliveryRequestOpt = deliveryRequestRepository.findById(requestId);
		DeliveryRequest deliveryRequest = deliveryRequestOpt
				.orElseThrow(() -> new RuntimeException("해당 요청 ID에 대한 DeliveryRequest가 존재하지 않습니다. ID: " + requestId));
		List<DeliveryWaypoint> waypoints = deliveryWaypointRepository.findAllByRequestIdOrderByDrop(requestId);
		boolean dropOrder1 = waypoints.size() > 0 ? true : false;
		boolean dropOrder2 = waypoints.size() > 1 ? true : false;
		boolean dropOrder3 = waypoints.size() > 2 ? true : false;

		PayBoxDTO payBoxDTO = PayBoxDTO.builder().requestId(requestId).dropOrder1(dropOrder1).dropOrder2(dropOrder2)
				.dropOrder3(dropOrder3).distance(deliveryRequest.getDistance())
				.weight((long) deliveryRequest.getTotalCargoWeight())
//				.caution(actualCalcDTO.isCaution())
//				.mountainous(actualCalcDTO.isMountainous())
				.estimateFee(deliveryRequest.getEstimatedFee()).build();

		return payBoxDTO;
	}

	@Override // 2차결제 row 생성
	public Long trySecondPayment(PaymentDTO paymentDTO) {

		Payment payment = Payment.builder().prepaidId(paymentDTO.getPaymentId()).settlement(false)
				.payStatus(PayStatusEnum.PENDING).build();
		return paymentRepository.save(payment).getPaymentId();
	}

	@Override // 2차 결제창 랜더링
	public PayBoxDTO getSecondPayBox(Long prepaidId) {

		Long paymentId = paymentRepository.findPaymentIdByPrepaidId(prepaidId);

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository
				.findDeliveryAssignmentByPaymentId(paymentId);

		ActualCalcDTO actualCalcDTO = deliveryAssignmentService.getActualCalc(deliveryAssignment.getAssignedId());
		PayBoxDTO payBoxDTO = PayBoxDTO.builder().requestId(actualCalcDTO.getRequestId()).paymentId(paymentId)
				.prepaidId(prepaidId).dropOrder1(actualCalcDTO.isDropOrder1()).dropOrder2(actualCalcDTO.isDropOrder2())
				.dropOrder3(actualCalcDTO.isDropOrder3()).distance(actualCalcDTO.getDistance())
				.weight(actualCalcDTO.getWeight()).caution(actualCalcDTO.isCaution())
				.mountainous(actualCalcDTO.isMountainous()).estimateFee(actualCalcDTO.getEstimateFee())
				.impUid(paymentRepository.findById(prepaidId).get().getImpUid()).build();

		return payBoxDTO;
	}


	@Transactional
	@Override//1차 결제 성공 시
	public void successFirstPayment(PaymentSuccessDTO paymentSuccessDTO) {

		log.info("Received DTO: {}", paymentSuccessDTO);
		Payment payment = paymentRepository.findById(paymentSuccessDTO.getPaymentId()).orElseThrow(() -> new RuntimeException("Payment not found!"));
		payment.setPayMethod(paymentSuccessDTO.getPayMethod());
		payment.setPayAmount(paymentSuccessDTO.getPayAmount());
		payment.setPayStatus(PayStatusEnum.COMPLETED);
		payment.setPaid(LocalDateTime.now());
		payment.setImpUid(paymentSuccessDTO.getImpUid());
		
		log.info("Found payment: {}", payment);

		paymentRepository.saveAndFlush(payment); // flush 강제
		log.info("After saveAndFlush, DB should be updated");

	}

	@Transactional
	@Override//2차 결제 성공 시
	public void successSecondPayment(PaymentSuccessDTO paymentSuccessDTO) {
		Payment payment = paymentRepository.findById(paymentSuccessDTO.getPaymentId()).orElseThrow();

		payment.setPayStatus(PayStatusEnum.ALLCOMPLETED);
		payment.setPaid(LocalDateTime.now());
		payment.setImpUid(paymentSuccessDTO.getImpUid());
		paymentRepository.save(payment);
		paymentRepository.flush();

	}

	@Transactional
	@Override//결제 실패 시
	public void failureSecondPayment(PaymentFailureDTO paymentFailureDTO) {
		Payment payment = paymentRepository.findById(paymentFailureDTO.getPaymentId()).orElseThrow();

		payment.setPayStatus(PayStatusEnum.FAILED);
		payment.setPaid(LocalDateTime.now());
		paymentRepository.save(payment);
		paymentRepository.flush();

	}
	

    private final RestTemplate restTemplate; // 스프링에서 HTTP 호출용

    private final String IMP_KEY = "1576161706372485";
    private final String IMP_SECRET = "XA4cfKZavvUUr261zjc6itgnoYvSqZaR2IohgfDzfbGkCr4AvJ1uWbnMUtXCZHPZHPjnWSLFHuLITCR7";//REST API Secret


	@Override // 영수증
	public RecieptDTO getReciept(Long paymentId) {

		Long prepaidId = paymentRepository.findPrepaidIdByPaymentId(paymentId);

		RecieptDTO recieptDTO = RecieptDTO.builder().paymentId(paymentId).prepaidId(prepaidId)
				.prepaidAmount(paymentRepository.findPayAmountByPaymentId(prepaidId))
				.prepaidMethod(paymentRepository.findMethodByPaymentId(prepaidId))
				.prepaidPaid(paymentRepository.findPaidByPaymentId(prepaidId)).paymentId(paymentId)
				.amount(paymentRepository.findPayAmountByPaymentId(paymentId))
				.method(paymentRepository.findMethodByPaymentId(paymentId))
				.paid(paymentRepository.findPaidByPaymentId(paymentId)).build();

		return recieptDTO;

	}

	@Override // 거래명세서
	public TransactionStatementDTO getTransaction(Long paymentId) {

		Long prepaidId = paymentRepository.findPrepaidIdByPaymentId(paymentId);

		TransactionStatementDTO transactionStatementDTO = TransactionStatementDTO.builder().prepaidId(prepaidId)
				.prepaidAmount(paymentRepository.findPayAmountByPaymentId(prepaidId))
				.prepaidPaid(paymentRepository.findPaidByPaymentId(prepaidId)).paymentId(paymentId)
				.amount(paymentRepository.findPayAmountByPaymentId(paymentId))
				.paid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		return transactionStatementDTO;
	}


}
