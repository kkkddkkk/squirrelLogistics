package com.gpt.squirrelLogistics.simulation.driver;

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

@Component
@RequiredArgsConstructor
@Builder
public class DummyTracker {

	public static final LatLng SEOUL_CITY_HALL = new LatLng(37.5662952, 126.9779451);
	public static final LatLng SEOUL_STATION = new LatLng(37.5546785, 126.9706069);

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

	// 300미터 터벌 지정.
	private static final double PERSIST_THRESHOLD_METERS = 300.0;

	private DummyDriver ensure(String driverId) {
		return driverMap.computeIfAbsent(driverId, id -> {
			var d = new DummyDriver(id, kakaoClient, scheduler, SEOUL_CITY_HALL);
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
	public com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO getCurrentRoute(String driverId) {
		return ensure(driverId).snapshot();
	}
	
    public void setCurrentAssignment(String driverId, Long assignedId) {
        currentAssignedId.put(driverId, assignedId);
    }
    
	
	private void maybePersist(String driverId, LatLng curr) {
        long now = System.currentTimeMillis();
        // 최초는 바로 저장(선택) 혹은 기준점만 세팅
        var prev = lastPersistedPos.get(driverId);
        if (prev == null) {
            trackingLogService.save(driverId, currentAssignedId.get(driverId), curr); // 최초도 저장하고 싶다면
            lastPersistedPos.put(driverId, curr);
            lastPersistedAtMs.put(driverId, now);
            return;
        }

        double meters = haversineMeters(prev, curr);
        if (meters >= PERSIST_THRESHOLD_METERS) {
            trackingLogService.save(driverId, currentAssignedId.get(driverId), curr);
            lastPersistedPos.put(driverId, curr);
            lastPersistedAtMs.put(driverId, now);
        }
    }

	
	//하버사인 거리 구하기.
    private static double haversineMeters(LatLng a, LatLng b) {
        double R = 6371000.0; // 지구 반지름(m)
        double dLat = Math.toRadians(b.getLat() - a.getLat());
        double dLng = Math.toRadians(b.getLng() - a.getLng());
        double lat1 = Math.toRadians(a.getLat());
        double lat2 = Math.toRadians(b.getLat());

        double h = Math.sin(dLat/2)*Math.sin(dLat/2)
                 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)*Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
        return R * c;
    }

}
