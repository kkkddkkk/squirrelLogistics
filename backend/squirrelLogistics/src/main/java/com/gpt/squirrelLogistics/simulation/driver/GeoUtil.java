package com.gpt.squirrelLogistics.simulation.driver;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.gpt.squirrelLogistics.common.LatLng;

public class GeoUtil {

	// 디투어용 원형 루프 경로 지흠
	static final double R = 6371000.0;

	//디투어 x와 y만큼을 이동한 새 LatLng.
	static LatLng moveByMeters(LatLng p, double dx, double dy) {
		double lat = Math.toRadians(p.getLat().doubleValue());
		double dLat = dy / R;
		double dLng = dx / (R * Math.cos(lat));
		double outLat = Math.toDegrees(lat + dLat);
		double outLng = p.getLng().doubleValue() + Math.toDegrees(dLng);
		return new LatLng(new BigDecimal(outLat), new BigDecimal(outLng));
	}
}

// 기존 모범적 경로에 원형 루프 경로를 추가해 이탈을 만드는 메서드.
final class DetourMutator {

	
	//디투어용 원형 루프 크기 지정 => 반지름:rMeters, 회전수:laps, insertRatio:경유지 사이 루프 삽입 위치.
	//필요시 여러번 호출 가능.
	static List<LatLng> injectCircularLoop(List<LatLng> base, double rMeters, int laps, int verticesPerLap,
			double insertRatio) {
		if (base == null || base.size() < 2)
			return base;
		int insertIdx = Math.max(1, Math.min(base.size() - 2, (int) Math.round(insertRatio * base.size())));
		LatLng center = base.get(insertIdx);

		// 루프 생성
		List<LatLng> loop = new ArrayList<>();
		int N = Math.max(16, verticesPerLap);
		for (int lap = 0; lap < Math.max(1, laps); lap++) {
			for (int i = 0; i < N; i++) {
				double theta = 2 * Math.PI * (i / (double) N) + (lap * 2 * Math.PI);
				double dx = rMeters * Math.cos(theta);
				double dy = rMeters * Math.sin(theta);
				loop.add(GeoUtil.moveByMeters(center, dx, dy));
			}
		}
		// 루프가 시작/끝이 동일하도록 닫아줌
		loop.add(loop.get(0));

		// base 앞부분 + 루프 + 뒷부분
		List<LatLng> out = new ArrayList<>(base.size() + loop.size());
		out.addAll(base.subList(0, insertIdx));
		out.addAll(loop);
		out.addAll(base.subList(insertIdx, base.size()));
		return out;
	}

	//원하는 추가거리에 도달할 때까지 루프 삽입.
	static List<LatLng> addExtraDistance(List<LatLng> base, double targetExtraMeters) {
		List<LatLng> cur = base;
		double remaining = targetExtraMeters;

		// 기본 설정: 반지름 550~700m, 1~2회전
		var rand = new java.util.Random();
		while (remaining > 500) {
			double r = 550 + rand.nextInt(150); // 550~700m
			int laps = (remaining > 6000 ? 2 : 1); // 남은 거리 많으면 2바퀴
			int N = 48; // 라인 부드러움
			double perLoop = 2 * Math.PI * r * laps; // 대략 추가 길이
			double insertRatio = 0.3 + rand.nextDouble() * 0.4; // 0.3~0.7 위치에 삽입

			cur = injectCircularLoop(cur, r, laps, N, insertRatio);
			remaining -= perLoop;
		}
		return cur;
	}
}
