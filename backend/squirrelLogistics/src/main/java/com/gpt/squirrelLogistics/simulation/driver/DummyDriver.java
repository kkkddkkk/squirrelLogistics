package com.gpt.squirrelLogistics.simulation.driver;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;

public class DummyDriver {

	public enum Mode {
		AUTO, MANUAL
	}

	private final String driverId;
	private final KakaoRouteClient kakaoClient;
	private final ScheduledExecutorService scheduler;

	private final Object lock = new Object();

	private List<LatLng> route = new ArrayList<>(); // 현재 레그 polyline
	private List<LatLng> expectedRoute = List.of();

	private int index = 0; // route 내 진행 인덱스
	private LatLng current = null; // 현재 좌표(빈 경로일 때도 유지)
	private Mode mode = Mode.AUTO;
	private boolean paused = false;

	private long tickMillis = 1000L; // 1초마다 전진
	private int stepPerTick = 1; // 틱당 몇 포인트 전진
	private ScheduledFuture<?> task; // 주행 작업 핸들

	// 이탈 판정용 히스테리시스(노이즈 방지)
	private static final double OUT_ENTER_M = 300.0; // 진입 임계값
	private static final double OUT_EXIT_M = 200.0; // 해제 임계값
	private static final int OUT_CONSEC_REQUIRED = 3; // 연속 틱 카운트
	private int outConsec = 0;
	private boolean outOfWay = false;

	// 각 틱마다 스냅샷을 푸시할 콜백 (Tracker가 주입)
	private java.util.function.Consumer<RouteInfoDTO> broadcaster = r -> {
	};

	// 중복 노이즈 덜어내기.
	public void setExpectedRoute(List<LatLng> polyline) {
		synchronized (lock) {
			var norm = kakaoClient.normalizeTrackPoints(polyline != null ? polyline : List.of());
			this.expectedRoute = new ArrayList<>(norm);
			this.outConsec = 0;
			this.outOfWay = false;
		}
		broadcast();
	}

	public DummyDriver(String driverId, KakaoRouteClient kakaoClient, ScheduledExecutorService scheduler,
			LatLng initialPosition) {
		this.driverId = driverId;
		this.kakaoClient = kakaoClient;
		this.scheduler = scheduler;
		this.current = Objects.requireNonNullElseGet(initialPosition,
				() -> new LatLng(new BigDecimal("37.5546785"), new BigDecimal("126.9706069"))); // 서울시청
	}

	private java.util.function.Consumer<LatLng> moveHook = p -> {
	};

	public void setMoveHook(java.util.function.Consumer<LatLng> hook) {
		this.moveHook = (hook != null ? hook : p -> {
		});
	}

	private void notifyMoved() {
		try {
			moveHook.accept(current);
		} catch (Exception ignore) {
		}
	}

	// --- 제어 ---

	public void setBroadcaster(java.util.function.Consumer<RouteInfoDTO> cb) {
		this.broadcaster = (cb != null ? cb : r -> {
		});
	}

	/** 현재 레그를 교체하고 시작점으로 스냅 */
	public void setRoute(List<LatLng> polyline) {

		synchronized (lock) {
			this.route = (polyline != null ? new ArrayList<>(polyline) : new ArrayList<>());
			this.index = 0;
			if (!this.route.isEmpty())
				this.current = this.route.get(0);
			this.outConsec = 0;
			this.outOfWay = false;
		}
		notifyMoved();
		broadcast();
	}

	/** 한 스텝 전진 (MANUAL일 때 버튼으로 호출, AUTO일 때 내부 틱에서 호출) */
	public void step() {
		synchronized (lock) {
			if (route.isEmpty())
				return;
			int next = Math.min(route.size() - 1, index + stepPerTick);
			index = next;
			current = route.get(index);
		}
		notifyMoved();
		broadcast();
	}

	/** 즉시 목적지로 점프(도착) */
	public void arriveNow() {
		synchronized (lock) {
			if (route.isEmpty())
				return;
			index = route.size() - 1;
			current = route.get(index);
		}
		notifyMoved();
		broadcast();
	}

	/** 일시정지/재개 */
	public void setPaused(boolean paused) {
		this.paused = paused;
	}

	/** 자동/수동 전환 */
	public void setMode(Mode mode) {
		this.mode = (mode != null ? mode : Mode.AUTO);
	}

	/** 속도 조절 */
	public void setTick(long millis, int step) {
		this.tickMillis = Math.max(100L, millis);
		this.stepPerTick = Math.max(1, step);
		restartAutoIfNeeded();
	}

	public void reset(LatLng startPos) {
		synchronized (lock) {
			this.route = new ArrayList<>();
			this.index = 0;
			this.current = (startPos != null ? startPos : this.current);
			this.outConsec = 0;
			this.outOfWay = false;
		}
		notifyMoved();
		broadcast();
	}

	public void softResetRoutes() {
		synchronized (lock) {
			this.route = new ArrayList<>();
			this.expectedRoute = List.of();
			this.index = 0;
			this.outConsec = 0;
			this.outOfWay = false;
		}
		notifyMoved();
		broadcast();
	}

	/** 자동 주행 시작(스케줄 등록) */
	public void start() {
		if (task != null && !task.isCancelled())
			return;
		task = scheduler.scheduleAtFixedRate(() -> {
			try {
				if (mode == Mode.AUTO && !paused) {
					synchronized (lock) {
						if (!route.isEmpty() && index < route.size() - 1) {
							index = Math.min(route.size() - 1, index + stepPerTick);
							current = route.get(index);
						}
					}
					notifyMoved();
					broadcast();
				}
			} catch (Throwable t) {
				t.printStackTrace();
			}
		}, 0, tickMillis, TimeUnit.MILLISECONDS);
	}

	/** 자동 주행 정지(스케줄 취소) */
	public void stop() {
		if (task != null) {
			task.cancel(false);
			task = null;
		}
	}

	private void restartAutoIfNeeded() {
		if (task != null) {
			stop();
			start();
		}
	}

	// --- 스냅샷 ---

	public RouteInfoDTO snapshot() {
		List<LatLng> visited;
		List<LatLng> expected;
		LatLng curr;
		List<LatLng> polyline;
		synchronized (lock) {
			int safeIndex = Math.max(0, Math.min(index, Math.max(0, route.size() - 1)));
			curr = (route.isEmpty() ? current : route.get(safeIndex));
			visited = route.isEmpty() ? List.of() : new ArrayList<>(route.subList(0, safeIndex + 1));
			expected = new ArrayList<>(expectedRoute);

			polyline = route.isEmpty() ? List.of() : new ArrayList<>(route);
		}

		long distance = 0L, duration = 0L;
		LatLng etaTarget = null;
		if (!expected.isEmpty()) {
			etaTarget = expected.get(expected.size() - 1);
		} else if (!polyline.isEmpty()) {
			etaTarget = polyline.get(polyline.size() - 1);
		}
		if (etaTarget != null) {
			distance = kakaoClient.calculateTotalDistance(curr, etaTarget);
			duration = kakaoClient.estimateDuration(curr, etaTarget);
		}

		// 이탈편차 추출.
		double devM = deviationFromExpectedMeters(curr, expectedRoute);

		// 정상 복귀 임계값 지정.
		if (devM >= OUT_ENTER_M) {
			if (++outConsec >= OUT_CONSEC_REQUIRED)
				outOfWay = true;
		} else if (devM <= OUT_EXIT_M) {
			outConsec = 0;
			outOfWay = false;
		}

		return RouteInfoDTO.builder().visited(visited).expected(expected).currentPosition(curr).distance(distance)
				.duration(duration).polyline(polyline).outOfWay(outOfWay).deviationMeters(devM).build();
	}

	private void broadcast() {
		try {
			broadcaster.accept(snapshot());
		} catch (Exception ignore) {
		}
	}

	// --- getters ---
	public String getDriverId() {
		return driverId;
	}

	// 점과 예상 경로를 이은 선분 간 최단거리 추출.
	private static double deviationFromExpectedMeters(LatLng p, List<LatLng> path) {
		if (p == null || path == null || path.size() < 2)
			return Double.NaN;
		double min = Double.POSITIVE_INFINITY;
		for (int i = 0; i < path.size() - 1; i++) {
			double d = pointToSegmentMeters(p, path.get(i), path.get(i + 1));
			if (d < min)
				min = d;
			// 성능 최적화가 필요하면: 근처 구간만 검사(슬라이딩 윈도우), R-Tree, 다운샘플링 등
		}
		return min;
	}

	// equirectangular 근사 기반 점-선분 거리(m)
	private static double pointToSegmentMeters(LatLng p, LatLng a, LatLng b) {
		final double R = 6371000.0;

		double lat0 = Math.toRadians(p.getLat().doubleValue());
		// 라디안
		double latA = Math.toRadians(a.getLat().doubleValue());
		double lonA = Math.toRadians(a.getLng().doubleValue());
		double latB = Math.toRadians(b.getLat().doubleValue());
		double lonB = Math.toRadians(b.getLng().doubleValue());
		double latP = Math.toRadians(p.getLat().doubleValue());
		double lonP = Math.toRadians(p.getLng().doubleValue());

		// local ENU(근사): x = R * cos(lat0) * dLon, y = R * dLat
		double xA = R * Math.cos(lat0) * (lonA - lonP);
		double yA = R * (latA - latP);
		double xB = R * Math.cos(lat0) * (lonB - lonP);
		double yB = R * (latB - latP);
		double x0 = 0.0, y0 = 0.0; // P를 원점으로 둠

		// 선분 AB에 대한 P(원점)의 수선 발
		double vx = xB - xA, vy = yB - yA;
		double wx = x0 - xA, wy = y0 - yA;
		double c1 = vx * wx + vy * wy;
		double c2 = vx * vx + vy * vy;

		double t = (c2 <= 0.0 ? 0.0 : c1 / c2); // degenerate 보호
		if (t < 0.0)
			t = 0.0;
		else if (t > 1.0)
			t = 1.0;

		double projX = xA + t * vx;
		double projY = yA + t * vy;

		// P(0,0)와 투영점의 거리
		return Math.hypot(projX, projY);
	}

	public void clearRoute() {
		setRoute(List.of());
	}

	public void clearExpectedRoute() {
		setExpectedRoute(List.of());
	}

	public void swapLeg(List<LatLng> expected, List<LatLng> driving, boolean snapToStart) {
		synchronized (lock) {
			var normExpected = kakaoClient.normalizeTrackPoints(expected != null ? expected : List.of());
			this.expectedRoute = new ArrayList<>(normExpected);

			this.route = (driving != null ? new ArrayList<>(driving) : new ArrayList<>());
			this.index = 0;
			if (snapToStart && !this.route.isEmpty()) {
				this.current = this.route.get(0);
			}
			// 이탈 히스테리시스 초기화
			this.outConsec = 0;
			this.outOfWay = false;
		}
		notifyMoved();
		broadcast();
	}

}
