package com.gpt.squirrelLogistics.simulation.driver;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.gpt.squirrelLogistics.common.LatLng;

public class PolyUtil {
	private PolyUtil() {}

    public static final class Snap {
        public final int segIdx;         // 스냅된 세그먼트 시작 인덱스 i (구간 i..i+1)
        public final double t;           // 구간 내 보간계수 [0,1]
        public final double distMeters;  // 점-선분 최단거리(m)
        public final LatLng snapped;     // 스냅된 좌표

        public Snap(int segIdx, double t, double distMeters, LatLng snapped) {
            this.segIdx = segIdx; this.t = t; this.distMeters = distMeters; this.snapped = snapped;
        }

        public double linearPos() { return segIdx + t; } // 경로상 선형 위치
    }

    /** from/to를 경로에 스냅해서 구간을 잘라 반환. 필요 시 역방향이면 뒤집어서 반환 */
    public static List<LatLng> sliceSubpath(List<LatLng> full, LatLng from, LatLng to) {
        if (full == null || full.size() < 2) return full != null ? new ArrayList<>(full) : List.of();

        Snap s = snapToPath(from, full);
        Snap e = snapToPath(to,   full);

        // 선형 위치 비교로 순서 정하기 (전체 경로가 역방향 저장되었을 가능성 방어)
        boolean reversed = e.linearPos() < s.linearPos();

        // 시작/끝 경계점을 포함하여 subpath 구성
        List<LatLng> out = new ArrayList<>();
        if (!reversed) {
            // s.segIdx..e.segIdx 구간
            out.add(lerp(full.get(s.segIdx), full.get(s.segIdx + 1), s.t));
            for (int i = s.segIdx + 1; i <= e.segIdx; i++) {
                out.add(full.get(i));
            }
            out.add(lerp(full.get(e.segIdx), full.get(e.segIdx + 1), e.t));
        } else {
            // 역방향이면 뒤집어서 반환 (from이 full상 뒤쪽, to가 앞쪽)
            out.add(lerp(full.get(s.segIdx), full.get(s.segIdx + 1), s.t));
            for (int i = s.segIdx; i >= e.segIdx + 1; i--) {
                out.add(full.get(i));
            }
            out.add(lerp(full.get(e.segIdx), full.get(e.segIdx + 1), e.t));
            java.util.Collections.reverse(out);
        }

        // 중복점 정리(스냅 지점이 기존 점과 같을 때)
        out = dedupConsecutive(out);
        return out;
    }

    /** 점을 polyline의 가장 가까운 선분에 스냅 */
    public static Snap snapToPath(LatLng p, List<LatLng> path) {
        if (p == null || path == null || path.size() < 2)
            throw new IllegalArgumentException("invalid path");

        double best = Double.POSITIVE_INFINITY;
        int bestIdx = 0; double bestT = 0; LatLng bestPoint = path.get(0);

        for (int i = 0; i < path.size() - 1; i++) {
            var a = path.get(i);
            var b = path.get(i + 1);
            var proj = projectPointToSegmentMeters(p, a, b);
            if (proj.distMeters < best) {
                best = proj.distMeters;
                bestIdx = i;
                bestT = proj.t;
                bestPoint = proj.snapped;
            }
        }
        return new Snap(bestIdx, bestT, best, bestPoint);
    }

    /** 선분 AB에 점 P를 투영 (로컬 평면 근사) */
    private static ProjResult projectPointToSegmentMeters(LatLng p, LatLng a, LatLng b) {
        final double R = 6371000.0;
        double lat0 = Math.toRadians(p.getLat().doubleValue());

        // 라디안
        double latA = Math.toRadians(a.getLat().doubleValue());
        double lonA = Math.toRadians(a.getLng().doubleValue());
        double latB = Math.toRadians(b.getLat().doubleValue());
        double lonB = Math.toRadians(b.getLng().doubleValue());
        double latP = Math.toRadians(p.getLat().doubleValue());
        double lonP = Math.toRadians(p.getLng().doubleValue());

        // equirectangular 로컬 평면 (P를 원점으로)
        double xA = R * Math.cos(lat0) * (lonA - lonP);
        double yA = R * (latA - latP);
        double xB = R * Math.cos(lat0) * (lonB - lonP);
        double yB = R * (latB - latP);

        double vx = xB - xA, vy = yB - yA;
        double wx = -xA,     wy = -yA;         // P(0,0) - A(xA,yA)
        double c2 = vx*vx + vy*vy;
        double t = (c2 <= 0 ? 0 : (vx*wx + vy*wy) / c2);
        if (t < 0) t = 0; else if (t > 1) t = 1;

        double px = xA + t * vx;
        double py = yA + t * vy;
        double d  = Math.hypot(px, py);

        // 다시 위도/경도로 보간해 스냅 좌표 생성
        LatLng snapped = lerp(a, b, t);

        return new ProjResult(t, d, snapped);
    }
    private static final class ProjResult {
        final double t; final double distMeters; final LatLng snapped;
        ProjResult(double t, double d, LatLng s){ this.t=t; this.distMeters=d; this.snapped=s; }
    }

    /** 위경도 선형 보간(짧은 구간이므로 근사 OK) */
    private static LatLng lerp(LatLng a, LatLng b, double t) {
        double lat = a.getLat().doubleValue() + (b.getLat().doubleValue() - a.getLat().doubleValue()) * t;
        double lng = a.getLng().doubleValue() + (b.getLng().doubleValue() - a.getLng().doubleValue()) * t;
        return new LatLng(BigDecimal.valueOf(lat), BigDecimal.valueOf(lng));
    }

    private static List<LatLng> dedupConsecutive(List<LatLng> in) {
        if (in.isEmpty()) return in;
        List<LatLng> out = new ArrayList<>(in.size());
        LatLng prev = null;
        for (LatLng p : in) {
            if (prev == null || !equalsLatLng(prev, p)) out.add(p);
            prev = p;
        }
        return out;
    }
    private static boolean equalsLatLng(LatLng a, LatLng b) {
        return a.getLat().compareTo(b.getLat()) == 0 && a.getLng().compareTo(b.getLng()) == 0;
    }
}
