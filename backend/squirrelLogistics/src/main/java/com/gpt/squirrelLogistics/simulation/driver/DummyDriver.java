package com.gpt.squirrelLogistics.simulation.driver;

import java.util.List;
import java.util.stream.Collectors;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;

public class DummyDriver {
	private final String driverId;
	private final List<LatLng> route;
	private volatile int index = 0;
	private KakaoRouteClient kakaoClient;

	public DummyDriver(String driverId, List<LatLng> route, KakaoRouteClient kakaoClient) {
		this.driverId = driverId;
		this.route = route;
		this.kakaoClient = kakaoClient;
	}

	public void start() {
		new Thread(() -> {
			while (index < route.size()) {
				try {
					Thread.sleep(1000); // 1초마다 이동
					index++;
					// ✅ 이동 로그 출력
					LatLng current = route.get(Math.min(index, route.size() - 1));
					System.out.println("[DummyDriver] " + driverId + " 이동 중: (" + current.getLat() + ", "
							+ current.getLng() + ")");
				} catch (InterruptedException e) {
					break;
				}
			}
			System.out.println("[DummyDriver] " + driverId + " 목적지 도착 완료");
		}).start();
	}

	public RouteInfoDTO toRouteInfoDTO() {
		int safeIndex = Math.min(index, route.size() - 1);

		List<LatLng> visited = route.subList(0, safeIndex + 1).stream().map(p -> new LatLng(p.getLat(), p.getLng()))
				.collect(Collectors.toList());

		List<LatLng> expected = route.subList(safeIndex + 1, route.size()).stream()
				.map(p -> new LatLng(p.getLat(), p.getLng())).collect(Collectors.toList());

		LatLng current = route.get(safeIndex);


		LatLng from = expected.get(0);
		LatLng to = expected.get(expected.size() - 1);

		int remainingDistance = kakaoClient.calculateTotalDistance(from, to);
		int estimatedDuration = kakaoClient.estimateDuration(from, to); // 속도 기준 임의 계산

		return RouteInfoDTO.builder()
				.visited(visited)
				.expected(expected)
				.currentPosition(new LatLng(current.getLat(), current.getLng()))
				.distance(remainingDistance)
				.duration(estimatedDuration)
				.build();
	}

}
