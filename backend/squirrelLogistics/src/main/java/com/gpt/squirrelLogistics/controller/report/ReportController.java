package com.gpt.squirrelLogistics.controller.report;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.service.report.ReportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/report")
public class ReportController {
	private final ReportService reportService;
	private final DeliveryAssignmentRepository assignmentRepository;
	private final String uploadDir = new File("uploads").getAbsolutePath() + "/";
	
	@GetMapping("/list")
	@TimedEndpoint("reportList")
	public List<Map<String, Object>> reportList(){
		
		return reportService.reportList();
	}
	
	@GetMapping
	@TimedEndpoint("viewReport")
	public ReportSlimResponseDTO viewReport(@RequestParam("reportId") Long reportId){
		return reportService.viewReport(reportId);
	}

	
	@PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
	@TimedEndpoint("regiReport")
	public ResponseEntity<?> regiReport(@RequestPart("report") String reportJson,
			@RequestPart(value = "files", required = false) List<MultipartFile> files)
			throws JsonMappingException, JsonProcessingException {
		log.info("reportJson raw: {}", reportJson);
		
		ObjectMapper mapper = JsonMapper.builder()
				.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES)
				.build();
		ReportRequestDTO reportRequestDTO = mapper.readValue(reportJson, ReportRequestDTO.class);

		if (files != null) {
		    for (MultipartFile file : files) {
		        try {
		            String filePath = uploadDir + file.getOriginalFilename();
		            File dest = new File(filePath);
		            dest.getParentFile().mkdirs();
		            file.transferTo(dest);

		            // DB에는 file.getOriginalFilename() 저장
		        } catch (Exception e) {
		        	log.error("File upload failed for {}: {}", file.getOriginalFilename(), e.getMessage(), e);
		            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
		        }
		    }
		}
		
		reportService.regiReport(reportRequestDTO, files);

		return ResponseEntity.ok("success");
	}

}
