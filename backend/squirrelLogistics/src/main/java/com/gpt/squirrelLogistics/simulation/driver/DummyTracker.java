package com.gpt.squirrelLogistics.simulation.driver;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.common.RouteJson;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
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

	public static final LatLng SEOUL_STATION = new LatLng(new BigDecimal("37.5546785"), new BigDecimal("126.9706069"));

	enum Phase {
		IDLE, TO_PICKUP, IN_TRANSIT
	}

	private final KakaoRouteClient kakaoClient;
	private final KakaoLocalClient localClient;
	private final SimpMessagingTemplate messaging;
	private final DeliveryTrackingLogService trackingLogService;
	private final DeliveryRequestRepository requestRepository;

	private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

	private final Map<String, DummyDriver> driverMap = new ConcurrentHashMap<>();
	private final Map<String, LatLng> lastPersistedPos = new ConcurrentHashMap<>();
	private final Map<String, Long> lastPersistedAtMs = new ConcurrentHashMap<>();
	private final Map<String, Long> currentAssignedId = new ConcurrentHashMap<>();
	private final Map<String, Phase> phaseMap = new ConcurrentHashMap<>();

	private static final double PERSIST_THRESHOLD_METERS = 50.0; 
	private static final long MIN_INTERVAL_MS = 2000; //2s.
	private static final long FORCE_SAVE_EVERY_MS = 5000; // 5초마다 1점.

	private DummyDriver ensure(String driverId) {
		return driverMap.computeIfAbsent(driverId, id -> {
			var d = new DummyDriver(id, kakaoClient, scheduler, SEOUL_STATION);
			d.setBroadcaster(route -> {
				// 운전자 전용 (기존)
				messaging.convertAndSendToUser(id, "/queue/driver", route);
				messaging.convertAndSend("/topic/driver/" + id, route);
			});
			// d.setBroadcaster(route -> messaging.convertAndSend("/topic/driver/" + id,
			// route));
			d.setMoveHook(pos -> maybePersist(id, pos));
			d.start();
			phaseMap.put(id, Phase.IDLE);
			return d;
		});
	}

	public void setCurrentAssignment(String driverId, Long assignedId) {
		currentAssignedId.put(driverId, assignedId);

		lastPersistedPos.remove(driverId);
		lastPersistedAtMs.remove(driverId);

		var d = ensure(driverId);
		d.setPaused(true);
		d.softResetRoutes();
		d.start();
		d.setPaused(false);
	}

	// 서울역 출발 상차지로 이동 시작.
	public void startToPickup(String driverId, Long assignedId, String pickupAddress) {
		setCurrentAssignment(driverId, assignedId);
		phaseMap.put(driverId, Phase.TO_PICKUP);
		var d = ensure(driverId);

		var from = SEOUL_STATION;
		var to = localClient.geocode(pickupAddress);
		var driving = kakaoClient.requestRoute(from, to).getPolyline();
		lastPersistedAtMs.put(driverId, System.currentTimeMillis());
		d.swapLeg(List.of(), driving, true); // expected 비워서 흔적 지우기.
		d.setMode(DummyDriver.Mode.AUTO);
		d.setPaused(false);

	}

	// 정상 경로용 다음 경로 셋업.
//	public void prepareLeg(String driverId, Long assignedId, String fromAddr, String toAddr, boolean auto) {
//		setCurrentAssignment(driverId, assignedId);
//		phaseMap.put(driverId, Phase.IN_TRANSIT); // ← 먼저 Phase 전환 (레이스 제거)
//		var d = ensure(driverId);
//
//		var from = localClient.geocode(fromAddr);
//		var to = localClient.geocode(toAddr);
//
//		List<LatLng> plannedFull = requestRepository.findExpectedPolylineByAssignedId(assignedId).orElse(null);
//		if (plannedFull == null || plannedFull.size() < 2) {
//			// 임시 카카오 경로.
//			plannedFull = kakaoClient.requestRoute(from, to).getPolyline();
//		}
//
//		// 레그에 해당하는 구간만 슬라이스.
//		List<LatLng> plannedLeg = PolyUtil.sliceSubpath(plannedFull, from, to);
//
//		// 이탈 판정용 예상경로 세팅.
//		d.setExpectedRoute(plannedLeg);
//
//		var poly = kakaoClient.requestRoute(from, to).getPolyline();
//
//		// 거리 누적 기준점을 픽업 위치로 ‘고정’ (원위치→픽업 포함 방지)
//		forcePersistAnchor(driverId, from);
//
//		d.setRoute(poly);
//		d.setMode(auto ? DummyDriver.Mode.AUTO : DummyDriver.Mode.MANUAL);
//		d.setPaused(false);
//	}

	private List<LatLng> loadPlannedFull(Long assignedId, LatLng from, LatLng to) {
		String json = requestRepository.findExpectedPolylineByAssignedId(assignedId).orElse(null);
		List<LatLng> plannedFull = RouteJson.parseOrEmpty(json);
		if (plannedFull.size() < 2) {
			plannedFull = kakaoClient.requestRoute(from, to).getPolyline();
		}
		return plannedFull;
	}

	public void prepareLeg(String driverId, Long assignedId, String fromAddr, String toAddr, boolean auto,
			boolean detour) {
		if (detour) {
			prepareLegWithDetour(driverId, assignedId, fromAddr, toAddr, auto, 5, 10);
			return;
		}
		setCurrentAssignment(driverId, assignedId);
		var d = ensure(driverId);

		// 세팅전 레이스 잠시 멈춤.
		d.setPaused(true);

		var from = localClient.geocode(fromAddr);
		var to = localClient.geocode(toAddr);

		// 예상 경로 불러오기.
		List<LatLng> plannedFull = loadPlannedFull(assignedId, from, to);
		List<LatLng> plannedLeg = PolyUtil.sliceSubpath(plannedFull, from, to);
		d.setExpectedRoute(plannedLeg);

		// 실제 주행 경로.
		var driving = kakaoClient.requestRoute(from, to).getPolyline();
		d.setRoute(driving);

		// 앵커점 저장 + 상태 전환.
		phaseMap.put(driverId, Phase.IN_TRANSIT);
		forcePersistAnchor(driverId, from);

		// 시작.
		d.setMode(auto ? DummyDriver.Mode.AUTO : DummyDriver.Mode.MANUAL);
		d.setPaused(false);
	}

	// 경로 이탈용 다음 경로 셋업.
	public void prepareLegWithDetour(String driverId, Long assignedId, String fromAddr, String toAddr, boolean auto,
			double extraKmMin, double extraKmMax) {
		
		setCurrentAssignment(driverId, assignedId);
		var d = ensure(driverId);

		d.setPaused(true);
		
		var from = localClient.geocode(fromAddr);
		var to = localClient.geocode(toAddr);

		// 예상 경로(문자열 → List) + 레그 슬라이스
		List<LatLng> plannedFull = loadPlannedFull(assignedId, from, to);
		List<LatLng> plannedLeg = PolyUtil.sliceSubpath(plannedFull, from, to);
		d.setExpectedRoute(plannedLeg);

		// 실제 주행 경로(카카오) + 디툴 삽입
		List<LatLng> driving = kakaoClient.requestRoute(from, to).getPolyline();
		double targetExtraM = (extraKmMin + Math.random() * (extraKmMax - extraKmMin)) * 1000.0;
		List<LatLng> drivingDetour = DetourMutator.addExtraDistance(driving, targetExtraM);
		d.setRoute(drivingDetour);

		phaseMap.put(driverId, Phase.IN_TRANSIT);
		forcePersistAnchor(driverId, from);
		
		d.setMode(auto ? DummyDriver.Mode.AUTO : DummyDriver.Mode.MANUAL);
		d.setPaused(false);
	}

	// 도착 => 즉시 점프해서 마지막으로 이동(디버그 모드).
	public void arriveNow(String driverId) {
		var d = ensure(driverId);
		d.arriveNow();
		var snap = d.snapshot();
		if (snap != null && snap.getPolyline() != null && !snap.getPolyline().isEmpty()) {
			var tail = snap.getPolyline().get(snap.getPolyline().size() - 1);
			persist(driverId, tail, System.currentTimeMillis());
		}
	}

	private void forcePersistAnchor(String driverId, LatLng anchor) {
		persist(driverId, anchor, System.currentTimeMillis());
	}

	private void persist(String driverId, LatLng curr, long now) {
		// 픽업 전 저장 안 함.
		if (phaseMap.getOrDefault(driverId, Phase.IDLE) != Phase.IN_TRANSIT) {
			return;
		}
		trackingLogService.save(driverId, currentAssignedId.get(driverId), curr);
		lastPersistedPos.put(driverId, curr);
		lastPersistedAtMs.put(driverId, now);
	}

	private void maybePersist(String driverId, LatLng curr) {
		if (currentAssignedId.get(driverId) == null)
			return;
		// 픽업 전 저장 안 함.
		if (phaseMap.getOrDefault(driverId, Phase.IDLE) != Phase.IN_TRANSIT) {
			return;
		}
		log.info("status={}", phaseMap.getOrDefault(driverId, Phase.IDLE));

		long now = System.currentTimeMillis();
		var prev = lastPersistedPos.get(driverId);
		Long lastT = lastPersistedAtMs.get(driverId);

		// 첫 점 보장
		if (prev == null) {
			persist(driverId, curr, now);
			return;
		}

		double meters = haversineMeters(prev, curr);

		// 시간 백업 저장 (거리와 무관하게 5초마다 1점)
		if (lastT == null || now - lastT >= FORCE_SAVE_EVERY_MS) {
			persist(driverId, curr, now);
			return;
		}

		// 거리 조건 (20m 이상, 300m 이상 스파이크 컷)
		if ((now - lastT) >= MIN_INTERVAL_MS && meters >= PERSIST_THRESHOLD_METERS && meters < 300) {
			persist(driverId, curr, now);
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

	public void pause(String driverId) {
		var d = ensure(driverId);
		d.setPaused(true); // 이동 스레드 멈춤
	}

	public void resumeAuto(String driverId) {
		var d = ensure(driverId);
		d.setMode(DummyDriver.Mode.AUTO);
		d.setPaused(false);
	}

	public void finishAssignment(String driverId) {
		phaseMap.put(driverId, Phase.IDLE);
		currentAssignedId.remove(driverId);
		lastPersistedPos.remove(driverId);
		lastPersistedAtMs.remove(driverId);

		var d = ensure(driverId);
		d.stop();
		d.reset(DummyTracker.SEOUL_STATION);
	}

	public RouteInfoDTO getCurrentRoute(String driverId) {
		return ensure(driverId).snapshot();
	}
}
