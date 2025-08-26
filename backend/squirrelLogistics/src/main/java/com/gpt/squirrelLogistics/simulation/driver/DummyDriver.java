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
	private int index = 0; // route 내 진행 인덱스
	private LatLng current = null; // 현재 좌표(빈 경로일 때도 유지)
	private Mode mode = Mode.AUTO;
	private boolean paused = false;

	private long tickMillis = 1000L; // 1초마다 전진
	private int stepPerTick = 1; // 틱당 몇 포인트 전진
	private ScheduledFuture<?> task; // 주행 작업 핸들

	// 각 틱마다 스냅샷을 푸시할 콜백 (Tracker가 주입)
	private java.util.function.Consumer<RouteInfoDTO> broadcaster = r -> {
	};

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
		synchronized (lock) {
			int safeIndex = Math.max(0, Math.min(index, Math.max(0, route.size() - 1)));
			curr = (route.isEmpty() ? current : route.get(safeIndex));
			visited = route.isEmpty() ? List.of() : new ArrayList<>(route.subList(0, safeIndex + 1));
			expected = (route.isEmpty() || safeIndex + 1 >= route.size()) ? List.of()
					: new ArrayList<>(route.subList(safeIndex + 1, route.size()));
		}

		long distance = 0L, duration = 0L;
		if (!expected.isEmpty()) {
			LatLng to = expected.get(expected.size() - 1);
			distance = kakaoClient.calculateTotalDistance(curr, to);
			duration = kakaoClient.estimateDuration(curr, to);
		}

		return RouteInfoDTO.builder().visited(visited).expected(expected).currentPosition(curr).distance(distance)
				.duration(duration).build();
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
}
