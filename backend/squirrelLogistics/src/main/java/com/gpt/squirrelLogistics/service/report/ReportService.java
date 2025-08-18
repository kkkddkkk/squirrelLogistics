package com.gpt.squirrelLogistics.service.report;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.reportImage.ReportImageRequestDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.reportImage.ReportImage;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class ReportService {

	private final ReportRepository reportRepository;
	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final ReportImageRepository reportImageRepository;

	// 신고리스트
	public List<Map<String, Object>> reportList() {
		List<Report> reports = reportRepository.findAll();
		
		List<Map<String, Object>> result = reports.stream().map(report -> {
			Map<String, Object> map = new HashMap<>();
			List <Object[]> addressList = deliveryAssignmentRepository.findStartEndAddressById(report.getDeliveryAssignment().getAssignedId());
			
			map.put("reportId", report.getReportId());
			map.put("rTitle", report.getRTitle());
			map.put("rContent", report.getRContent());
			map.put("regDate", report.getRegDate());
			map.put("startAddress", addressList.get(0)[0]);
			map.put("endAddress", addressList.get(0)[1]);
			map.put("fileNames", reportImageRepository.findImgsByReportId(report.getReportId()));
			
			return map;
		}).toList();
		
		return result;
	}

	// 신고 상세 확인
	public ReportSlimResponseDTO viewReport(Long ReportId) {
		Report report = reportRepository.findById(ReportId).get();
		List<String> images = reportImageRepository.findImgsByReportId(ReportId);

		ReportSlimResponseDTO reportSlimResponseDTO = ReportSlimResponseDTO.builder().fileName(images)
				.rTitle(report.getRTitle()).rContent(report.getRContent()).regDate(report.getRegDate())
				.reporter(report.getReporter()).build();

		return reportSlimResponseDTO;
	}

	// 신고 작성
	public ResponseEntity<?> regiReport(ReportRequestDTO reportRequestDTO, List<MultipartFile> files) {
		log.info("신고 등록 중");

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findById(reportRequestDTO.getAssignedId())
				.orElseThrow(() -> new RuntimeException("DeliveryAssignment not found"));

		Report report = Report.builder().deliveryAssignment(deliveryAssignment).reporter(reportRequestDTO.getReporter())
				.rTitle(reportRequestDTO.getRTitle()).rContent(reportRequestDTO.getRContent())
				.rStatus(ReportStatusEnum.IN_REVIEW).rCate(reportRequestDTO.getRCate()).regDate(LocalDateTime.now())
				.build();

		Report savedReport = reportRepository.save(report);
		log.info(reportRequestDTO.getRTitle());

//		log.info(savedReport);
		// 2. 파일이 있으면 ReportImg에 reportId 넣어서 저장
		if (files != null) {
			files.forEach(file -> {
				ReportImage img = ReportImage.builder().report(savedReport) // FK
						.fileName(file.getOriginalFilename()).build();
				reportImageRepository.save(img);
			});
		}

		return ResponseEntity.ok("success");
	}
}
