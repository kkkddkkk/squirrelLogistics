package com.gpt.squirrelLogistics.controller.driverReport;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.report.ReportController;
import com.gpt.squirrelLogistics.dto.report.DriverReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;
import com.gpt.squirrelLogistics.enums.driverAction.DriverActionEnum;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthErrorCode;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;
import com.gpt.squirrelLogistics.service.report.ReportService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/driver-report")
public class DriverReportController {

	private final DeliveryAssignmentService assignmentService;
	private final ReportService reportService;
	private final DriverTokenValidService tokenValidService;

	@PostMapping("/regist")
	public ResponseEntity<?> driverReportRegist(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestBody DriverReportRequestDTO dto) {
		log.info("driverReportRegist");
		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f) {
			return toError(f);
		}

		Long driverId = ((AuthOutcome.Success) outcome).driverId();
		Long assignId = null;
		if (dto.getRCate() == ReportCategoryEnum.EMERGENCY) {
			assignId = assignmentService.getLatestAssignmentIdByDriverId(driverId);

			if (assignId == null) {
				// 오류 처리.
				ResponseEntity.status(HttpStatus.NOT_FOUND).body("운송 이력이 한번도 발견되지 않은 운전자입니다.");
			}
		} else {
			assignId = dto.getAssignedId();
		}

		dto.setAssignedId(assignId);
		ReportResponseDTO res = reportService.registerDriverReport(dto);

		return ResponseEntity.ok("신고가 접수되었습니다. 신고번호:" + res.getReportId());

	}

//	@PostMapping("/list")
//	public ResponseEntity<?> driverReportRegist(
//			@RequestHeader(value = "Authorization", required = false) String authHeader){
//		
//		AuthOutcome outcome = tokenValidService.resolve(authHeader);
//		if (outcome instanceof AuthOutcome.Failure f) {
//			return toError(f);
//		}
//
//		Long driverId = ((AuthOutcome.Success) outcome).driverId();
//
//		ReportResponseDTO res = reportService.registerDriverReport(dto);
//		
//		return ResponseEntity.ok("신고가 접수되었습니다. 신고번호:" + res.getReportId());
//
//	}

	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}

}
