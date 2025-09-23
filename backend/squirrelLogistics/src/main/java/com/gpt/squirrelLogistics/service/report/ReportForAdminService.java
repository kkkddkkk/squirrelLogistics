package com.gpt.squirrelLogistics.service.report;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.controller.actualCalc.ActualCalcController;
import com.gpt.squirrelLogistics.dto.report.DetailReportContainsUsersDTO;
import com.gpt.squirrelLogistics.dto.report.DetailReportDTO;
import com.gpt.squirrelLogistics.dto.report.MostReportedDTO;
import com.gpt.squirrelLogistics.dto.report.MostReportedDashBoardDTO;
import com.gpt.squirrelLogistics.dto.report.NewestReportsDTO;
import com.gpt.squirrelLogistics.dto.report.ReportCateCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportManagementDTO;
import com.gpt.squirrelLogistics.dto.report.ReportManagementToUseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportMonthlyCountDTO;
import com.gpt.squirrelLogistics.dto.report.ReportStatusCountDTO;
import com.gpt.squirrelLogistics.entity.report.Report;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.repository.reportImage.ReportImageRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.repository.answer.AnswerRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportForAdminService {

	private final ActualCalcController actualCalcController;

	private final ModelMapper getMapper;

	private final ReportRepository reportRepository;
	private final AnswerRepository answerRepository;
	private final DriverRepository driverRepository;
	private final CompanyRepository companyRepository;
	private final ReportImageRepository reportImageRepository;

	// 신고상태별 건수 찾기
	@Async
	public CompletableFuture<List<ReportStatusCountDTO>> statusCount() {
		return CompletableFuture.completedFuture(reportRepository.findStatusCount());
	}

	// 최신 미확인 신고 n건 찾기(제목, 신고일)
	@Async
	public CompletableFuture<List<NewestReportsDTO>> newestReports(int page, int size) {
		return CompletableFuture.completedFuture(reportRepository.findNewestReports(PageRequest.of(page, size)));
	}

	// 가장 많이 신고당한 사람 n명 찾기(이름, 신고건수, role)
	@Async
	public CompletableFuture<List<MostReportedDashBoardDTO>> mostReportedUser(int page, int size) {
		List<MostReportedDTO> lists = reportRepository.findMostReported(PageRequest.of(page, size));

		List<CompletableFuture<MostReportedDashBoardDTO>> dtoList = lists.stream()
				.map(list -> CompletableFuture.supplyAsync(() -> {
					Long reportedId = list.getReportedId();
					Long reportCount = list.getReportCount();
					ReportReporterEnum reporterRole = list.getReporter();
					String role;
					String userName;
					if (reporterRole == ReportReporterEnum.DRIVER || reporterRole == ReportReporterEnum.SYSTEM) {
						role = "물류회사";
						userName = companyRepository.findUserNameByCompanyId(reportedId);
					} else {
						role = "운전자";
						userName = driverRepository.findUserNameByDriverId(reportedId);
					}
					return MostReportedDashBoardDTO.builder().reportedName(userName).reportedId(reportedId)
							.reportCount(reportCount).role(role).build();
				})).collect(Collectors.toList());

		List<MostReportedDashBoardDTO> dashBoardList = dtoList.stream().map(CompletableFuture::join)
				.collect(Collectors.toList());

		return CompletableFuture.completedFuture(dashBoardList);
	}

	// 카테고리별 건수 찾기
	@Async
	public CompletableFuture<List<ReportCateCountDTO>> cateCount() {
		return CompletableFuture.completedFuture(reportRepository.findCateCount());
	}

	// 월별 건수 찾기
	@Async
	public CompletableFuture<List<ReportMonthlyCountDTO>> monthlyCount(int year) {
		return CompletableFuture.completedFuture(reportRepository.findMonthlyCount(year));
	}

	// 신고 게시판
	public Page<ReportManagementToUseDTO> reportManagement(int page, int size, String keyword, ReportStatusEnum status,
			ReportCategoryEnum cate) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
		Page<ReportManagementDTO> lists = reportRepository.findAllReports(pageable, keyword, status, cate);

		List<ReportManagementToUseDTO> dtoList = lists.stream().map(list -> {
			Long reportedId = list.getReporter();
			ReportReporterEnum enumRole = list.getRole();
			String role;
			String userName;
			if (enumRole == ReportReporterEnum.COMPANY) {
				role = "물류회사";
			} else if (enumRole == ReportReporterEnum.DRIVER) {
				role = "운전자";
			} else {
				role = "시스템";
			}
			return ReportManagementToUseDTO.builder().status(list.getStatus()).cate(list.getCate())
					.reportId(list.getReportId()).reporterId(reportedId).role(role).reporterName(list.getReporterName())
					.regDate(list.getRegDate()).title(list.getTitle()).build();
		}).collect(Collectors.toList());
		return new PageImpl<>(dtoList, pageable, lists.getTotalElements());
	}

	// 상세신고
	@Async
	public List<DetailReportContainsUsersDTO> detailReport(Long reportId) {

		List<DetailReportDTO> detailReportDTOs = reportRepository.detailReport(reportId);
		List<DetailReportContainsUsersDTO> dtoList = new ArrayList<>();
		for (DetailReportDTO dto : detailReportDTOs) {
			ReportReporterEnum reporter = dto.getReporter();
			String reporterName = null;
			String reporterNum = null;
			String reportedName = null;
			String reportedNum = null;

			if (reporter.equals(ReportReporterEnum.COMPANY)) {
				reporterName = companyRepository.findUserNameByCompanyId(dto.getReporterId());
				reporterNum = companyRepository.findUserNumByCompanyId(dto.getReporterId());
				reportedName = driverRepository.findUserNameByDriverId(dto.getReportedId());
				reportedNum = driverRepository.findUserNumByDriverId(dto.getReportedId());
			} else {
				reporterName = driverRepository.findUserNameByDriverId(dto.getReporterId());
				reporterNum = driverRepository.findUserNumByDriverId(dto.getReporterId());
				reportedName = companyRepository.findUserNameByCompanyId(dto.getReportedId());
				reportedNum = companyRepository.findUserNumByCompanyId(dto.getReportedId());
			}

			List<String> imgUrls = reportImageRepository.findImgsByReportId(reportId);
			List<Long> answerIdList = answerRepository.findAnswerIdByReportId(reportId);
			Long answerId = 0L;
			String answerContent = "아직 답변이 등록되지 않았습니다.";
			if (answerIdList != null && !answerIdList.isEmpty()) {
				answerId = answerIdList.get(0);
				answerContent = answerRepository.findAnswerByReportId(reportId).get(0);
			}

			dtoList.add(DetailReportContainsUsersDTO.builder().reporterId(dto.getReporterId()).reporterNum(reporterNum)
					.reporterName(reporterName).reportedId(dto.getReportedId()).reportedName(reportedName)
					.reportedNum(reportedNum).imgUrls(imgUrls).title(dto.getTitle()).content(dto.getContent())
					.reporter(reporter).regDate(dto.getRegDate()).answerId(answerId).answerContent(answerContent)
					.build());
		}
		return dtoList;
	}

	// 신고 상태를 미확인 -> 확인 중으로 변경
	public void setReportInReview(Long reportId) {
		Report report = reportRepository.findById(reportId).orElseThrow();

		ReportStatusEnum oldStatus = report.getRStatus();

		if (oldStatus.equals(ReportStatusEnum.PENDING)) {
			report.setRStatus(ReportStatusEnum.IN_REVIEW);
		}

		reportRepository.save(report);
		reportRepository.flush();
	}

	// 신고 상태를 확인 중 ->완료로 바꾸기으로 변경
	public void setReportInActionTaken(Long reportId) {
		Report report = reportRepository.findById(reportId).orElseThrow();

		ReportStatusEnum oldStatus = report.getRStatus();

		if (oldStatus.equals(ReportStatusEnum.IN_REVIEW)) {
			report.setRStatus(ReportStatusEnum.ACTION_TAKEN);
		}

		reportRepository.save(report);
		reportRepository.flush();
	}
}