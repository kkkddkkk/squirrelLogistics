package com.gpt.squirrelLogistics.controller.companyHistory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/companyHistory")
public class CompanyHistoryController {
	private final DeliveryAssignmentRepository repository;
	
	@GetMapping
	public List<DeliveryAssignment> getHistory(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDateTime date){
		if(date !=null) {
			return repository.findByCompletedAt(date);
		}
		return repository.findAll();
	}
	
	
	
}
