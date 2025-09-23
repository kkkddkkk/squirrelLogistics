package com.gpt.squirrelLogistics.service.settlement;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.gpt.squirrelLogistics.controller.settlement.SettlementController.Interval;
import com.gpt.squirrelLogistics.dto.page.RequestPageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.settlement.MethodAggDTO;
import com.gpt.squirrelLogistics.dto.settlement.SettleRequestDTO;
import com.gpt.squirrelLogistics.dto.settlement.SummaryDTO;
import com.gpt.squirrelLogistics.dto.settlement.TrendBucketDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledDTO;
import com.gpt.squirrelLogistics.dto.settlement.UnsettledPageRequestDTO;

public interface SettlementService {

	//기능: 이번달 재무지표 집계 (CardStat용).
	SummaryDTO getMonthlySummary(Instant instant, Instant instant2, String string);
	
	//기능: 미정산 생태로 대기중인 완료 결제건 수, 금액 합 집계 (정산 버튼용).
	UnsettledDTO getUnsettledSummary();

	//기능: 결제 수단별 매출액 집계 (막대 그래프용).
	List<MethodAggDTO> getByMethod(Instant f, Instant t);

	//기능: 기간별 매출액 집계 (라인 그래프용).
	List<TrendBucketDTO> getTrend(Instant f, Instant t, Interval iv);

	//기능: 미정산 결제내역 페이징 처리 후 리턴.
	RequestPageResponseDTO<PaymentDTO> getPage(UnsettledPageRequestDTO req);

	//기능: 미정산 결제건 정산 처리.
	ResponseEntity<?> settlePayments(SettleRequestDTO req);


}
