package com.gpt.squirrelLogistics.controller.companyHistory;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.company.CompanyHistoryContentDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DetailHistoryDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.user.AuthService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/companyHistory")
public class CompanyHistoryController {
	private final DeliveryAssignmentRepository repository;
	private final DeliveryAssignmentService service;
	private final AuthService authService;
	private final FindUserByTokenService findUserByTokenService;
	private final CompanyRepository companyRepository; 
	
	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	
	@GetMapping
	@TimedEndpoint("getTodayList")//clear
	public List<Object[]> getTodayList(@RequestHeader("Authorization")String token, 
			@RequestParam("date") LocalDate wantToStart){
		Long userId = findUserByTokenService.getUserIdByToken(token);
		Long companyId = companyRepository.findCompanyIdByUserId(userId);
		
		
		return service.getTodayList(wantToStart, companyId);
	}
	
	@GetMapping("/getTodayContent")
	@TimedEndpoint("getTodayContent")
	public CompanyHistoryContentDTO getTodayContent(@RequestParam("assignedId") Long assignedId){
//		
		return service.getTodayContent(assignedId);
	}
	
	@GetMapping("/calendar")
	@TimedEndpoint("getCalendar")//clear
	public List<LocalDate> getCalendar(@RequestHeader("Authorization")String token){
		Long userId = findUserByTokenService.getUserIdByToken(token);
		Long companyId = companyRepository.findCompanyIdByUserId(userId);

		return service.getHistoryDate(companyId);
	}
	
	@GetMapping("/detailHistory")
	@TimedEndpoint("detailHistory")
	public DetailHistoryDTO getDetailHistory(@RequestParam("assignedId") Long assignedId) {
		return service.getDetailHistory(assignedId);
	}
	
	@PutMapping("/cancel")
	@TimedEndpoint("cancel")
	public void cancel(@RequestParam("assignedId") Long assignedId) {
		service.cancel(assignedId);
	}
	
	
}
