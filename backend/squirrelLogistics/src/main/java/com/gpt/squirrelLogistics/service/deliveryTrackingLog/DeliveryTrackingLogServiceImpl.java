package com.gpt.squirrelLogistics.service.deliveryTrackingLog;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.common.EncodedRouteSummary;
import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.entity.deliveryTrackingLog.DeliveryTrackingLog;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryTrackingLog.DeliveryTrackingLogRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class DeliveryTrackingLogServiceImpl implements DeliveryTrackingLogService {

	private final DeliveryTrackingLogRepository trackRepo;
	private final DeliveryAssignmentRepository assignRepo;
	private final KakaoRouteClient routeClient;

	@Override
	@Transactional
	public void save(String driverId, Long assignedId, LatLng pos) {
		var ref = assignRepo.getReferenceById(assignedId);
		var log = DeliveryTrackingLog.builder().deliveryAssignment(ref).lat(pos.getLat())
				.lng(pos.getLng()).createdAt(LocalDateTime.now()).build();
		DeliveryTrackingLogServiceImpl.log.info("lat + lng: " + pos.getLat() + pos.getLng());
		trackRepo.save(log);
	}

	//작성자: 고은설.
	//기능: 거리 + 폴리라인 리턴.
	@Override
	@Transactional
	public EncodedRouteSummary extractActualRoute(Long assignedId, boolean isDeleteAll) {

		List<LatLng> points = trackRepo.findPathByAssignedId(assignedId);
		if (points.isEmpty()) {
			return EncodedRouteSummary.builder().distance(0L).encodedPolyline("").build();
		}

		// 요약값 계산 (거리 + 인코딩)
		EncodedRouteSummary summary = routeClient.summarizeRecordedPath(points);

		// 원본 route JSON 직렬화(보관/리포트용)
		// String json = routeClient.toJsonRoute(points);

		// 원본 로그 삭제로 용량 절감
		if(isDeleteAll) {
			trackRepo.deleteByDeliveryAssignment_AssignedId(assignedId);
		}

		return summary;

	}
}
