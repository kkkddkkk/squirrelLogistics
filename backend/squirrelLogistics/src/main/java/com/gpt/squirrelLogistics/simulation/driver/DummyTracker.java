package com.gpt.squirrelLogistics.simulation.driver;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.service.deliveryTrackingLog.DeliveryTrackingLogService;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@Builder
@Log4j2
public class DummyTracker {

	public static final LatLng SEOUL_STATION = 
		    new LatLng(new BigDecimal("37.5546785"), new BigDecimal("126.9706069"));

	private final KakaoRouteClient kakaoClient;
	private final KakaoLocalClient localClient; // 주소→좌표 (네가 이미 쓰는 geocode 클라이언트)
	private final SimpMessagingTemplate messaging; // WS 브로드캐스트
	private final DeliveryTrackingLogService trackingLogService;

	// 스케줄러는 공유 스레드풀 1~2개면 충분
	private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

	private final Map<String, DummyDriver> driverMap = new ConcurrentHashMap<>();
	private final Map<String, LatLng> lastPersistedPos = new ConcurrentHashMap<>();
	private final Map<String, Long> lastPersistedAtMs = new ConcurrentHashMap<>();
	private final Map<String, Long> currentAssignedId = new ConcurrentHashMap<>();
	private final Map<String, Boolean> isBeforePickup = new ConcurrentHashMap<>();

	// 100미터 터벌 지정.
	private static final double PERSIST_THRESHOLD_METERS = 100.0;
	private static final long MIN_INTERVAL_MS = 3000;

	private static final boolean INCLUDE_PRE_PICKUP_LOGS = false;

	private DummyDriver ensure(String driverId) {
		return driverMap.computeIfAbsent(driverId, id -> {
			var d = new DummyDriver(id, kakaoClient, scheduler, SEOUL_STATION);
			// 브로드캐스트 콜백 주입
			d.setBroadcaster(routeInfo -> messaging.convertAndSend("/topic/driver/" + id, routeInfo));
			d.setMoveHook(pos -> maybePersist(id, pos));
			d.start(); // 자동 틱 시작 (mode 기본 AUTO)
			return d;
		});
	}

	public void setMode(String driverId, DummyDriver.Mode mode) {
		ensure(driverId).setMode(mode);
	}

	/** 집하처 이동 시작: 서울역 → 픽업 주소 */
	public void startToPickup(String driverId, Long assignedId, String pickupAddress) {
		setCurrentAssignment(driverId, assignedId);
		var d = ensure(driverId);
		var from = SEOUL_STATION;
		var to = localClient.geocode(pickupAddress);
		var polyline = kakaoClient.requestRoute(from, to).getPolyline();
		d.setRoute(polyline); // 경로 세팅 즉시 브로드캐스트
		d.setMode(DummyDriver.Mode.AUTO);
		d.setPaused(false);
		isBeforePickup.put(driverId, true); // 출발→픽업 중
	}

	/** 다음 레그 준비: from → to (주소 문자열) */
	public void prepareLeg(String driverId, Long assignedId, String fromAddr, String toAddr, boolean auto) {
		setCurrentAssignment(driverId, assignedId);
		var d = ensure(driverId);
		var from = localClient.geocode(fromAddr);
		var to = localClient.geocode(toAddr);
		var polyline = kakaoClient.requestRoute(from, to).getPolyline();
		d.setRoute(polyline);
		d.setMode(auto ? DummyDriver.Mode.AUTO : DummyDriver.Mode.MANUAL);
		d.setPaused(false);
		isBeforePickup.put(driverId, false); // 이제 본운송 시작
	}

	/** 즉시 도착으로 점프 */
	public void arriveNow(String driverId) {
		ensure(driverId).arriveNow();
	}

	/** MANUAL 모드에서 한 스텝만 전진 */
	public void nudge(String driverId) {
		ensure(driverId).step();
	}

	/** 현재 라우트 스냅샷(REST 폴백용) */
	public RouteInfoDTO getCurrentRoute(String driverId) {
		return ensure(driverId).snapshot();
	}

	public void setCurrentAssignment(String driverId, Long assignedId) {
		currentAssignedId.put(driverId, assignedId);
		lastPersistedPos.remove(driverId);
		lastPersistedAtMs.remove(driverId);
		isBeforePickup.put(driverId, true);
	}

	private void maybePersist(String driverId, LatLng curr) {
		// 픽업 전 구간 전체 무시
		if (!INCLUDE_PRE_PICKUP_LOGS && Boolean.TRUE.equals(isBeforePickup.get(driverId))) {
			return;
		}

		long now = System.currentTimeMillis();
		Long lastAt = lastPersistedAtMs.get(driverId);
		if (lastAt != null && now - lastAt < MIN_INTERVAL_MS)
			return;

		var prev = lastPersistedPos.get(driverId);
		if (prev == null) {
			// 이제 픽업 이후 첫 점만 강제 저장
			log.info("lat={}, scale={}", curr.getLat(), curr.getLat().scale());
			trackingLogService.save(driverId, currentAssignedId.get(driverId), curr);
			lastPersistedPos.put(driverId, curr);
			lastPersistedAtMs.put(driverId, now);
			return;
		}

		double meters = haversineMeters(prev, curr);
		if (meters >= PERSIST_THRESHOLD_METERS && meters < 300 /* 스파이크 컷 */) {
			log.info("lat={}, scale={}", curr.getLat(), curr.getLat().scale());
			trackingLogService.save(driverId, currentAssignedId.get(driverId), curr);
			lastPersistedPos.put(driverId, curr);
			lastPersistedAtMs.put(driverId, now);
		}
	}

	// 하버사인 거리 구하기.
	private static double haversineMeters(LatLng a, LatLng b) {
	    double R = 6371000.0; // 지구 반지름(m)

	    double latA = a.getLat().doubleValue();
	    double latB = b.getLat().doubleValue();
	    double lngA = a.getLng().doubleValue();
	    double lngB = b.getLng().doubleValue();

	    double dLat = Math.toRadians(latB - latA);
	    double dLng = Math.toRadians(lngB - lngA);
	    double lat1 = Math.toRadians(latA);
	    double lat2 = Math.toRadians(latB);

	    double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
	            + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	    double c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
	    return R * c;
	}

}
