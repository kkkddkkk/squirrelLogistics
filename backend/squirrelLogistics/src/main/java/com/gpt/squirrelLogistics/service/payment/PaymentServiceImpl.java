package com.gpt.squirrelLogistics.service.payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointServiceImpl;
import com.gpt.squirrelLogistics.config.PaymentConfig;
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
	private final DeliveryRequestService deliveryRequestService;
	private final PaymentConfig paymentConfig;

	@Override
	public PaymentConfig.PaymentAccountInfo getPaymentAccountInfo(String payMethod) {
		return paymentConfig.getPaymentAccountInfo(payMethod);
	}
	
	@Override
	public void logPaymentAccountInfo(String payMethod, String impUid) {
		PaymentConfig.PaymentAccountInfo accountInfo = getPaymentAccountInfo(payMethod);
	}


	
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

		List<Object[]> estimateCalcList = deliveryRequestService.getEstimateCalc(requestId);

		List<Object> handlingIds = estimateCalcList.stream().map(arr -> arr[arr.length - 1])
				.collect(Collectors.toList());

		Optional<Integer> maxHandlingId = estimateCalcList.stream()
				.map(arr -> ((Number) arr[arr.length - 1]).intValue()) // Object → int 변환
				.max(Integer::compareTo);

		// mountainous, caution 계산
		boolean mountainous = false;
		boolean caution = false;
		if (!maxHandlingId.isPresent()) {
			mountainous = false;
			caution = false;
		} else if ((maxHandlingId.get() == 3) || (maxHandlingId.get() == 2 && handlingIds.contains(1))) {
			mountainous = true;
			caution = true;
		} else if ((maxHandlingId.get() == 2) || (maxHandlingId.get() == 1)) {
			if (maxHandlingId.get() == 2)
				mountainous = true;
			else
				caution = true;
		}

		System.out.println("requestID: " + requestId);

		Optional<DeliveryRequest> deliveryRequestOpt = deliveryRequestRepository.findById(requestId);
		DeliveryRequest deliveryRequest = deliveryRequestOpt
				.orElseThrow(() -> new RuntimeException("해당 요청 ID에 대한 DeliveryRequest가 존재하지 않습니다. ID: " + requestId));
		List<DeliveryWaypoint> waypoints = deliveryWaypointRepository.findAllByRequestIdOrderByDrop(requestId);
		boolean dropOrder1 = waypoints.size() > 2 ? true : false;
		boolean dropOrder2 = waypoints.size() > 3 ? true : false;
		boolean dropOrder3 = waypoints.size() > 4 ? true : false;

		PayBoxDTO payBoxDTO = PayBoxDTO.builder().requestId(requestId).dropOrder1(dropOrder1).dropOrder2(dropOrder2)
				.dropOrder3(dropOrder3).distance(deliveryRequest.getDistance())
				.weight((long) deliveryRequest.getTotalCargoWeight()).caution(mountainous).mountainous(caution)
				.paymentId(paymentId).estimateFee(deliveryRequest.getEstimatedFee()).build();

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
		String impUid = paymentRepository.findimpUidPaymentId(prepaidId);

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository
				.findDeliveryAssignmentByPaymentId(paymentId);

		ActualCalcDTO actualCalcDTO = deliveryAssignmentService.getActualCalc(deliveryAssignment.getAssignedId());
		PayBoxDTO payBoxDTO = PayBoxDTO.builder().requestId(actualCalcDTO.getRequestId()).paymentId(paymentId)
				.prepaidId(prepaidId).dropOrder1(actualCalcDTO.isDropOrder1()).dropOrder2(actualCalcDTO.isDropOrder2())
				.dropOrder3(actualCalcDTO.isDropOrder3()).distance(actualCalcDTO.getDistance())
				.weight(actualCalcDTO.getWeight()).caution(actualCalcDTO.isCaution())
				.mountainous(actualCalcDTO.isMountainous()).estimateFee(actualCalcDTO.getEstimateFee())
				.impUid(impUid).build();

		return payBoxDTO;
	}

	@Transactional
	@Override // 1차 결제 성공 시
	public void successFirstPayment(PaymentSuccessDTO paymentSuccessDTO) {

		log.info("=== 1차 결제 성공 처리 시작 ===");
		log.info("받은 데이터: paymentId={}, payMethod={}, payAmount={}, impUid={}", 
			paymentSuccessDTO.getPaymentId(), 
			paymentSuccessDTO.getPayMethod(), 
			paymentSuccessDTO.getPayAmount(), 
			paymentSuccessDTO.getImpUid());

		// 결제 방법에 따른 계정 정보 로깅 및 검증
		logPaymentAccountInfo(paymentSuccessDTO.getPayMethod(), paymentSuccessDTO.getImpUid());
		
		// 결제 검증: 결제 방법과 계정 정보 일치 여부 확인
		PaymentConfig.PaymentAccountInfo accountInfo = getPaymentAccountInfo(paymentSuccessDTO.getPayMethod());
		if (accountInfo == null || accountInfo.getImpKey() == null) {
			log.error("결제 계정 정보를 찾을 수 없습니다. 결제 방법: {}", paymentSuccessDTO.getPayMethod());
			throw new RuntimeException("Invalid payment account configuration");
		}

		Payment payment = paymentRepository.findById(paymentSuccessDTO.getPaymentId())
				.orElseThrow(() -> new RuntimeException("Payment not found!"));
		
		log.info("기존 Payment 엔티티: paymentId={}, payMethod={}, payStatus={}", 
			payment.getPaymentId(), payment.getPayMethod(), payment.getPayStatus());
		
		// 결제 정보 설정
		payment.setPayMethod(paymentSuccessDTO.getPayMethod());
		payment.setPayAmount(paymentSuccessDTO.getPayAmount());
		payment.setPayStatus(PayStatusEnum.COMPLETED);
		payment.setPaid(LocalDateTime.now());
		payment.setImpUid(paymentSuccessDTO.getImpUid());
		
		log.info("설정된 Payment 엔티티: paymentId={}, payMethod={}, payAmount={}, payStatus={}, impUid={}", 
			payment.getPaymentId(), payment.getPayMethod(), payment.getPayAmount(), 
			payment.getPayStatus(), payment.getImpUid());
		
		// 결제 계정 정보 저장 (디버깅용)
		log.info("1차 결제 성공 - Payment ID: {}, 결제 방법: {}, I'mport 계정: {}", 
			payment.getPaymentId(), payment.getPayMethod(), accountInfo.getImpKey());
		
		Payment savedPayment = paymentRepository.saveAndFlush(payment); // flush 강제
		log.info("저장된 Payment 엔티티: paymentId={}, payMethod={}, payAmount={}, payStatus={}, impUid={}", 
			savedPayment.getPaymentId(), savedPayment.getPayMethod(), savedPayment.getPayAmount(), 
			savedPayment.getPayStatus(), savedPayment.getImpUid());
		
		log.info("=== 1차 결제 성공 처리 완료 ===");
	}

	@Transactional
	@Override // 2차 결제 성공 시
	public void successSecondPayment(PaymentSuccessDTO paymentSuccessDTO) {
		// 결제 방법에 따른 계정 정보 로깅 및 검증
		logPaymentAccountInfo(paymentSuccessDTO.getPayMethod(), paymentSuccessDTO.getImpUid());
		
		// 결제 검증: 결제 방법과 계정 정보 일치 여부 확인
		PaymentConfig.PaymentAccountInfo accountInfo = getPaymentAccountInfo(paymentSuccessDTO.getPayMethod());
		if (accountInfo == null || accountInfo.getImpKey() == null) {
			log.error("결제 계정 정보를 찾을 수 없습니다. 결제 방법: {}", paymentSuccessDTO.getPayMethod());
			throw new RuntimeException("Invalid payment account configuration");
		}

		Payment payment = paymentRepository.findById(paymentSuccessDTO.getPaymentId()).orElseThrow();

		payment.setPayStatus(PayStatusEnum.ALLCOMPLETED);
		payment.setPaid(LocalDateTime.now());
		payment.setImpUid(paymentSuccessDTO.getImpUid());
		
		// 결제 계정 정보 저장 (디버깅용)
		log.info("2차 결제 성공 - Payment ID: {}, 결제 방법: {}, I'mport 계정: {}", 
			payment.getPaymentId(), payment.getPayMethod(), accountInfo.getImpKey());
		
		paymentRepository.save(payment);
		paymentRepository.flush();

	}
	
	@Transactional
	@Override // 환불 성공 시
	public void successRefundPayment(RefundDTO refundDTO) {
		Payment payment = paymentRepository.findById(refundDTO.getPaymentId()).orElseThrow();
		payment.setPayStatus(PayStatusEnum.ALLCOMPLETED);
		payment.setPaid(LocalDateTime.now());
		payment.setPayAmount(refundDTO.getAmount());
		paymentRepository.save(payment);
		paymentRepository.flush();
	}

	@Transactional
	@Override // 결제 실패 시
	public void failureSecondPayment(PaymentFailureDTO paymentFailureDTO) {
		Payment payment = paymentRepository.findById(paymentFailureDTO.getPaymentId()).orElseThrow();

		// 결제 실패 시에도 계정 정보 확인 (기존 결제 방법 정보 사용)
		String payMethod = payment.getPayMethod();
		if (payMethod != null) {
			logPaymentAccountInfo(payMethod, payment.getImpUid());
			log.warn("2차 결제 실패 - Payment ID: {}, 결제 방법: {}", 
				payment.getPaymentId(), payMethod);
		} else {
			log.warn("2차 결제 실패 - Payment ID: {}, 결제 방법 정보 없음", payment.getPaymentId());
		}

		payment.setPayStatus(PayStatusEnum.FAILED);
		payment.setPaid(LocalDateTime.now());
		paymentRepository.save(payment);
		paymentRepository.flush();

	}

	@Override // 영수증
	public RecieptDTO getReciept(Long paymentId) {

		Long prepaidId = paymentRepository.findPrepaidIdByPaymentId(paymentId);

		RecieptDTO recieptDTO = null;
		if (prepaidId != null) {
			recieptDTO = RecieptDTO.builder().paymentId(paymentId).prepaidId(prepaidId)
					.prepaidAmount(paymentRepository.findPayAmountByPaymentId(prepaidId))
					.prepaidMethod(paymentRepository.findMethodByPaymentId(prepaidId))
					.prepaidPaid(paymentRepository.findPaidByPaymentId(prepaidId)).paymentId(paymentId)
					.amount(paymentRepository.findPayAmountByPaymentId(paymentId))
					.method(paymentRepository.findMethodByPaymentId(paymentId))
					.paid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		} else {
			recieptDTO = RecieptDTO.builder().prepaidId(paymentId)
					.prepaidAmount(paymentRepository.findPayAmountByPaymentId(paymentId))
					.prepaidMethod(paymentRepository.findMethodByPaymentId(paymentId))
					.prepaidPaid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		}

		return recieptDTO;

	}


	@Override // 거래명세서
	public TransactionStatementDTO getTransaction(Long paymentId) {
		Long assignedId = deliveryAssignmentRepository.findIdByPaymentId(paymentId);

		if (assignedId == null) {
			assignedId = deliveryRequestRepository.findIdByPaymentId(paymentId);
		}
		log.info(assignedId);

		String assignedmentStatus = null;

		if (assignedId != null) {
			List<String> statuses = deliveryAssignmentRepository.findStatusById(assignedId);
			if (!statuses.isEmpty()) {
				assignedmentStatus = statuses.get(0);
			}
		}

		Long prepaidId = paymentRepository.findPrepaidIdByPaymentId(paymentId);
		TransactionStatementDTO transactionStatementDTO = null;

		if (assignedmentStatus == null) {
			transactionStatementDTO = TransactionStatementDTO.builder().prepaidId(paymentId)
					.prepaidAmount(paymentRepository.findPayAmountByPaymentId(paymentId))
					.prepaidPaid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		} else if (assignedmentStatus.equals("COMPLETED")) {
			transactionStatementDTO = TransactionStatementDTO.builder().prepaidId(prepaidId)
					.prepaidAmount(paymentRepository.findPayAmountByPaymentId(prepaidId))
					.prepaidPaid(paymentRepository.findPaidByPaymentId(prepaidId)).paymentId(paymentId)
					.amount(paymentRepository.findPayAmountByPaymentId(paymentId))
					.paid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		} else {
			transactionStatementDTO = TransactionStatementDTO.builder().prepaidId(paymentId)
					.prepaidAmount(paymentRepository.findPayAmountByPaymentId(paymentId))
					.prepaidPaid(paymentRepository.findPaidByPaymentId(paymentId)).build();
		}

		return transactionStatementDTO;
	}


}
