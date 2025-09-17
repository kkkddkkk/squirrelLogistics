package com.gpt.squirrelLogistics.controller.banner;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.banner.BannerService;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.user.AuthService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/banner")
public class BannerController {
	
	private final FindUserByTokenService findUserByTokenService;
	private final BannerService bannerService;
	
	@Getter @Setter
	@AllArgsConstructor
	public class ApiResponse<T> {
		private boolean success;
	    private String message;
	    private T data;
	}
	
	@GetMapping("/list")
	@TimedEndpoint("getBannerList")//clear
	public ResponseEntity<ApiResponse<List<BannerListDTO>>> getBannerList(@RequestHeader("Authorization")String token){
//		Long userId = findUserByTokenService.getUserIdByToken(token);
//		Long companyId = companyRepository.findCompanyIdByUserId(userId);
		List<BannerListDTO> list = bannerService.getBannerList();
		
		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", list));
	}
	
}
