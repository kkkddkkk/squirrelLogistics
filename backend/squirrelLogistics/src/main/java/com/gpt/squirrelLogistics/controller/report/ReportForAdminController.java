package com.gpt.squirrelLogistics.controller.report;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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
import com.gpt.squirrelLogistics.controller.banner.BannerController.ApiResponse;
import com.gpt.squirrelLogistics.controller.deliveryAssignment.DeliveryAssignmentController;
import com.gpt.squirrelLogistics.dto.banner.BannerListDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentSuccessDTO;
import com.gpt.squirrelLogistics.dto.report.DetailReportContainsUsersDTO;
import com.gpt.squirrelLogistics.dto.report.DetailReportDTO;
import com.gpt.squirrelLogistics.dto.report.MostReportedDTO;
import com.gpt.squirrelLogistics.dto.report.MostReportedDashBoardDTO;
import com.gpt.squirrelLogistics.dto.report.NewestReportsDTO;
import com.gpt.squirrelLogistics.dto.report.ReportCateCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportDashBoardDTO;
import com.gpt.squirrelLogistics.dto.report.ReportManagementToUseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportMonthlyCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportRequestDTO;
import com.gpt.squirrelLogistics.dto.report.ReportSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportStatusCountDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.report.ReportForAdminService;
import com.gpt.squirrelLogistics.service.report.ReportService;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/admin/report")
public class ReportForAdminController {

	private final DeliveryAssignmentController deliveryAssignmentController;
	private final ReportForAdminService reportForAdminService;
	private final DeliveryAssignmentRepository assignmentRepository;
	private final String uploadDir = new File("uploads").getAbsolutePath() + "/";
	private final FindUserByTokenService findUserByTokenService;
	private final CompanyRepository companyRepository;
	private final DriverRepository driverRepository;
	private final UserRepository userRepository;

	@Getter
	@Setter
	@AllArgsConstructor
	public class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;
	}

	@GetMapping("/dashboard")
	@TimedEndpoint("dashboard") // clear
	public ResponseEntity<ApiResponse<ReportDashBoardDTO>> getReportDashBoard(
			@RequestHeader("Authorization") String token) {
		CompletableFuture<List<ReportStatusCountDTO>> statusCountList = reportForAdminService.statusCount();
		CompletableFuture<List<NewestReportsDTO>> newestReportList = reportForAdminService.newestReports(0, 5);
		CompletableFuture<List<MostReportedDashBoardDTO>> mostReportedList = reportForAdminService.mostReportedUser(0,
				5);
		CompletableFuture<List<ReportCateCountDTO>> cateCountList = reportForAdminService.cateCount();
		CompletableFuture<List<ReportMonthlyCountDTO>> monthlyCountList = reportForAdminService.monthlyCount(LocalDateTime.now().getYear());

		CompletableFuture.allOf(statusCountList, newestReportList, mostReportedList, cateCountList, monthlyCountList)
				.join();

		List<ReportStatusCountDTO> statusCount = statusCountList.join();
		List<NewestReportsDTO> newestReport = newestReportList.join();
		List<MostReportedDashBoardDTO> mostReported = mostReportedList.join();
		List<ReportCateCountDTO> cateCount = cateCountList.join();
		List<ReportMonthlyCountDTO> monthlyCount = monthlyCountList.join();

		ReportDashBoardDTO reportDashBoardDTO = ReportDashBoardDTO.builder().statusCount(statusCount)
				.newestReports(newestReport).mostReported(mostReported).cateCount(cateCount).monthlyCount(monthlyCount)
				.build();

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", reportDashBoardDTO));
	}

	@GetMapping("/rank")
	@TimedEndpoint("rank")
	public ResponseEntity<ApiResponse<List<MostReportedDashBoardDTO>>> getReportedRank(
			@RequestHeader("Authorization") String token) {

		CompletableFuture<List<MostReportedDashBoardDTO>> mostReportedList = reportForAdminService
				.mostReportedUser(0, 10);

		List<MostReportedDashBoardDTO> mostReported = mostReportedList.join();

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", mostReported));
	}
	
	@GetMapping("/monthly")
	@TimedEndpoint("monthly")
	public ResponseEntity<ApiResponse<List<ReportMonthlyCountDTO>>> getReportMonthly(
			@RequestHeader("Authorization") String token,
			@RequestParam(name = "year", defaultValue = "#{T(java.time.LocalDate).now().year}") int year) {

		CompletableFuture<List<ReportMonthlyCountDTO>> monthlyCountList = reportForAdminService.monthlyCount(year);

		List<ReportMonthlyCountDTO> monthlyCount = monthlyCountList.join();

		return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", monthlyCount));
	}

	@GetMapping("/list")
	@TimedEndpoint("list")
	public ApiResponse<Page<ReportManagementToUseDTO>> getReportList(@RequestHeader("Authorization") String token,
			@RequestParam(name = "keyword", defaultValue = "") String keyword,
			@RequestParam(name = "status", defaultValue = "") String status,
			@RequestParam(name = "cate", defaultValue = "") String cate,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "10") int size) {

		ReportStatusEnum statusEnum = null;
		ReportCategoryEnum categoryEnum = null;

		if (status != null && !status.isEmpty()) {
			statusEnum = ReportStatusEnum.valueOf(status); // 여긴 반드시 status 문자열과 Enum 이름 일치
		}

		if (cate != null && !cate.isEmpty()) {
			categoryEnum = ReportCategoryEnum.valueOf(cate); // 여기도 동일
		}

		Page<ReportManagementToUseDTO> list = reportForAdminService.reportManagement(page, size, keyword, statusEnum,
				categoryEnum);

		return new ApiResponse<Page<ReportManagementToUseDTO>>(true, "조회 성공", list);
	}

	@GetMapping
	@TimedEndpoint("detail")
	public ApiResponse<DetailReportContainsUsersDTO> getDetailReport(@RequestHeader("Authorization") String token,
			@RequestParam(name = "reportId") Long reportId) {

		DetailReportContainsUsersDTO list = reportForAdminService.detailReport(reportId).get(0);
		reportForAdminService.setReportInReview(reportId);

		return new ApiResponse<DetailReportContainsUsersDTO>(true, "조회 성공", list);
	}

}
