package com.gpt.squirrelLogistics.service.deliveryOrchestrator;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.deliveryRequest.CreatedRequestPaymentInfoDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class DeliveryOrchestrator {

	private final DeliveryRequestService deliveryRequestService;
	private final DeliveryAssignmentService deliveryAssignmentService;

	private final DriverRepository driverRepository;
	private final CompanyRepository companyRepository;
	private final VehicleTypeRepository vehicleTypeRepository;
	private final DeliveryAssignmentRepository assignmentRepository;

	@Transactional
	public CreatedRequestPaymentInfoDTO createAndPropose(DeliveryRequestRequestDTO requestDTO, PaymentDTO paymentDTO,
			Long driverId) {

		// 예외 상황 리턴.
		var driver = driverRepository.findById(driverId).orElse(null);
		if (driver == null) {

			log.info("[ERROR] 해당 driverId의 드라이버가 발견되지 않음");
			return null;
		}

		if (requestDTO.getCompanyId() != null && !companyRepository.existsById(requestDTO.getCompanyId())) {
			log.info("[ERROR] 해당 CompanyId의 회사가 발견되지 않음");
			return null;

		}
		if (requestDTO.getVehicleTypeId() != null && !vehicleTypeRepository.existsById(requestDTO.getVehicleTypeId())) {
			log.info("[ERROR] 해당 VehicleTypeId의  차종이 발견되지 않음");
			return null;

		}

		// 요청 정보 기반으로 운전자 중복 일정 방지.
		if (requestDTO.getWantToStart() != null && requestDTO.getWantToEnd() != null) {
			boolean overlaps = assignmentRepository.existsOverlappingByRequestWindow(driverId,
					requestDTO.getWantToStart(), requestDTO.getWantToEnd(),
					List.of(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
							com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS));
			if (overlaps) {
				log.info("[ERROR] 해당 날짜에 기사 일정이 발견됨");
				return null;
			}
		}

		// 1) 요청 생성 (+ 선결제/검증 로직은 requestService 쪽에 유지)
		CreatedRequestPaymentInfoDTO result = deliveryRequestService.create(paymentDTO, requestDTO);

		// 2) 제안/할당 생성 (추가금 결제는 없음)
		Map<String, Object> assignResult = deliveryAssignmentService.propose(result.getRequestId(), driverId);

		return result;
	}

}
