import { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import markerImg from '../../pages/Driver/images/marker_blue.png';
import truckImg from '../../pages/Driver/images/truck.png';
import API_SERVER_HOST from '../../api/apiServerHost'

//---------- 환경 상수 ----------.
//카카오 맵 API용 자바스크립트 키 (지도 렌더링용).
const KAKAO_JAVASCRIPT_KEY = "3fc6c3128e9cb8839fceb113aba2924a";
//카카오 맵 API용 REST API 키 (경로 추출용).
const KAKAO_NAVIGATION_REST_KEY = "866375a2baec52acc22ae2904599355c";

//---------- 공용 카카오 SDK 로드 함수 ----------.
function loadKakaoSdk() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }
    const script = document.createElement("script");
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onerror = reject;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    document.head.appendChild(script);
  });
}

//---------- 스프링부트 더미 운전자 출발 시작 ----------.
export const useStartDummyRoute = () => {
  const startDummyRoute = useCallback(async ({ driverId, startLat, startLng, endLat, endLng }) => {
    try {
      const res = await axios.get(`${API_SERVER_HOST}/route/start`, {
        params: {
          driverId,
          startLat,
          startLng,
          endLat,
          endLng,
        },
      });
      console.log("Dummy route started:", res.data);
      return res.data;
    } catch (err) {
      console.error("Dummy route start failed:", err);
      throw err;
    }
  }, []);

  return startDummyRoute;
};

//---------- <실시간 이동> 지도 훅 ----------.
/* {visited, expected, currentPosition, distance, duration} */
export const useKakaoRouteMap = (mapContainerRef, route) => {

  //카카오 객체,지도,도형,마커 등등 관리용 ref.
  const mapRef = useRef(null);
  const visitedPolylineRef = useRef(null);
  const expectedPolylineRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const pulseOverlayRef = useRef(null);
  const pulseElRef = useRef(null);
  const markerImageRef = useRef(null);
  const truckImageRef = useRef(null);
  const firstFitBoundsRef = useRef(true);
  const kakaoRef = useRef(null);

  //좌우 반전을 위해 오버레이로 변경.
  const truckOverlayRef = useRef(null);
  const truckElRef = useRef(null);
  const prevLatLngRef = useRef(null);
  const directionHoldRef = useRef({ dir: 0, consec: 0 }); // 히스테리시스.

  useEffect(() => {
    let canceled = false;

    (async () => {
      if (!mapContainerRef.current) return;
      const kakao = await loadKakaoSdk().catch((e) => { console.error(e); return null; });
      if (!kakao || canceled) return;
      kakaoRef.current = kakao;

      // 초기 맵 1회 생성
      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.9780), // 임시(서울 시청)
          level: 5,
        });

        // 필요 시 커스텀 마커 이미지
        // markerImageRef.current = new kakao.maps.MarkerImage(markerImg, new kakao.maps.Size(32, 46));
        // truckImageRef.current = new kakao.maps.MarkerImage(truckImg, new kakao.maps.Size(45, 25));
      }
    })();

    return () => { canceled = true; };
  }, [mapContainerRef]);

  // route 변경 시마다 라인/마커 업데이트
  useEffect(() => {
    const kakao = kakaoRef.current;
    if (!kakao || !mapRef.current) return;
    if (!route) return;

    const { visited = [], expected = [], polyline = [], currentPosition } = route;
    if (!currentPosition || currentPosition.lat == null || currentPosition.lng == null) return;

    const LatLng = kakao.maps.LatLng;

    // 좌표 정제
    const toLL = (p) => {
      if (!p) return null;
      const lat = typeof p.lat === 'number' ? p.lat : parseFloat(p.lat);
      const lng = typeof p.lng === 'number' ? p.lng : parseFloat(p.lng);
      return Number.isFinite(lat) && Number.isFinite(lng) ? new LatLng(lat, lng) : null;
    };

    const visitedPath = visited.map(toLL).filter(Boolean);
    const expectedPath = expected.map(toLL).filter(Boolean);
    const polylinePath = (Array.isArray(polyline) ? polyline : []).map(toLL).filter(Boolean);
    const currentLatLng = toLL(currentPosition);
    if (!currentLatLng) return;

    // 경로가 하나도 없음
    const endPt =
      (expectedPath.length ? expectedPath[expectedPath.length - 1] : null) ||
      (polylinePath.length ? polylinePath[polylinePath.length - 1] : null) ||
      null;

    // --- 동서 방향 계산 (equirectangular 근사) ---
    const prev = prevLatLngRef.current;
    let flip = false;
    if (prev) {
      const R = 6371000; // m
      const toRad = (deg) => (deg * Math.PI) / 180;
      const lat0 = toRad((prev.getLat() + currentLatLng.getLat()) / 2);
      const dLon = toRad(currentLatLng.getLng() - prev.getLng());
      // 동서(x) 성분(m). +면 동쪽(→), -면 서쪽(←)
      const dx = R * Math.cos(lat0) * dLon;
      // 노이즈 방지 임계값(3m) + 연속 프레임 히스테리시스(2틱)
      const THRESH = 3;
      const H_CONSEC = 2;
      let dir = 0;
      if (dx > THRESH) dir = +1;
      else if (dx < -THRESH) dir = -1;

      const st = directionHoldRef.current;
      if (dir !== 0) {
        if (st.dir === dir) st.consec += 1;
        else { st.dir = dir; st.consec = 1; }
      }
      // dir가 -1로 두 틱 이상 유지되면 flip
      if (st.dir === -1 && st.consec >= H_CONSEC) flip = true;
      if (st.dir === +1 && st.consec >= H_CONSEC) flip = false;
    }
    prevLatLngRef.current = currentLatLng;


    // visited polyline
    if (!visitedPolylineRef.current) {
      visitedPolylineRef.current = new kakao.maps.Polyline({
        map: mapRef.current,
        path: visitedPath,
        strokeWeight: 4,
        strokeColor: "#999",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
    } else {
      visitedPolylineRef.current.setPath(visitedPath);
    }

    // expected polyline
    if (!expectedPolylineRef.current) {
      expectedPolylineRef.current = new kakao.maps.Polyline({
        map: mapRef.current,
        path: expectedPath,
        strokeWeight: 4,
        strokeColor: "#113F67",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
    } else {
      expectedPolylineRef.current.setPath(expectedPath);
    }

    // 마커 이미지
    if (typeof markerImg === "string" && markerImg) {
      markerImageRef.current = new kakao.maps.MarkerImage(markerImg, new kakao.maps.Size(32, 46));
    } else {
      markerImageRef.current = null;
    }
    if (typeof truckImg === "string" && truckImg) {
      truckImageRef.current = new kakao.maps.MarkerImage(truckImg, new kakao.maps.Size(45, 25));
    } else {
      truckImageRef.current = null;
    }

    // fitBounds
    if (firstFitBoundsRef.current && (visitedPath.length + expectedPath.length + polylinePath.length) > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      [...visitedPath, ...expectedPath, ...polylinePath].forEach(p => bounds.extend(p));
      mapRef.current.setBounds(bounds);
      firstFitBoundsRef.current = false;
    }

    // end marker
    if (endPt) {
      if (!endMarkerRef.current) {
        endMarkerRef.current = new kakao.maps.Marker({
          map: mapRef.current,
          position: endPt,
          ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
        });
      } else {
        endMarkerRef.current.setPosition(endPt);
        if (markerImageRef.current) endMarkerRef.current.setImage(markerImageRef.current);
      }
    } else if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
    }


    // ▶ 커스텀 오버레이로 트럭 아이콘 렌더(좌우반전 지원)
    if (!truckElRef.current) {
      const wrap = document.createElement('div');
      wrap.className = 'live-map-truck';
      const img = document.createElement('img');
      // 기존 truckImg 경로 그대로 사용
      img.src = typeof truckImg === 'string' ? truckImg : '';
      wrap.appendChild(img);
      truckElRef.current = wrap;
    }
    if (flip) truckElRef.current.classList.add('flip');
    else truckElRef.current.classList.remove('flip');

    if (!truckOverlayRef.current) {
      truckOverlayRef.current = new kakao.maps.CustomOverlay({
        map: mapRef.current,
        position: currentLatLng,
        content: truckElRef.current,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 3,
      });
    } else {
      truckOverlayRef.current.setPosition(currentLatLng);
    }

    // pulse overlay
    if (!pulseElRef.current) {
      const div = document.createElement("div");
      div.className = "live-map-pulse-circle";
      pulseElRef.current = div;
    }
    if (!pulseOverlayRef.current) {
      pulseOverlayRef.current = new kakao.maps.CustomOverlay({
        map: mapRef.current,
        position: currentLatLng,
        content: pulseElRef.current,
        yAnchor: 1.0,
        xAnchor: 0.5,
      });
    } else {
      pulseOverlayRef.current.setPosition(currentLatLng);
    }

    // current marker
    // if (!currentMarkerRef.current) {
    //   currentMarkerRef.current = new kakao.maps.Marker({
    //     map: mapRef.current,
    //     position: currentLatLng,
    //     ...(truckImageRef.current ? { image: truckImageRef.current } : {}),
    //   });
    // } else {
    //   currentMarkerRef.current.setPosition(currentLatLng);
    //   if (truckImageRef.current) currentMarkerRef.current.setImage(truckImageRef.current);
    // }
  }, [route]);

  // 언마운트 정리
  useEffect(() => {
    return () => {
      const items = [
        visitedPolylineRef.current,
        expectedPolylineRef.current,
        //currentMarkerRef.current,
        truckOverlayRef.current,
        endMarkerRef.current,
        pulseOverlayRef.current,
      ];
      items.forEach(it => it && it.setMap && it.setMap(null));
    };
  }, []);
};

//---------- <정적/고정> 지도 훅 ----------.
export const useStaticRouteMap = ({
  mapContainerRef,
  expectedPolyline,
  expectedRoute,
  waypoints
}) => {
  const mapRef = useRef(null);
  const markerImageRef = useRef(null);
  const markersRef = useRef([]);
  const lineRef = useRef(null);
  const kakaoRef = useRef(null);
  const geocoderRef = useRef(null);

  // Google Encoded Polyline 디코더
  const decodePolyline = (str) => {
    let index = 0, lat = 0, lng = 0;
    const pts = [];
    while (index < str.length) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      pts.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return pts;
  };

  const normalizeRoutePoints = () => {
    // 1) 인코딩 폴리라인 우선
    if (expectedPolyline && expectedPolyline.trim()) {
      try { return decodePolyline(expectedPolyline.trim()); } catch { }
    }
    // 2) JSON 문자열 or 배열
    if (!expectedRoute) return null;
    try {
      if (typeof expectedRoute === "string") {
        const arr = JSON.parse(expectedRoute);
        return Array.isArray(arr) ? arr : null;
      }
      if (Array.isArray(expectedRoute)) return expectedRoute;
    } catch { }
    return null;
  };

  const geocodeIfNeeded = async (kakao, waypoints) => {
    if (!kakao?.maps?.services) return [];
    if (!geocoderRef.current) geocoderRef.current = new kakao.maps.services.Geocoder();

    return Promise.all(
      (waypoints || []).map(async (wp) => {
        if (wp.lat != null && wp.lng != null) {
          return { lat: Number(wp.lat), lng: Number(wp.lng), title: wp.title || wp.address };
        }
        if (wp.address) {
          return new Promise((resolve) => {
            geocoderRef.current.addressSearch(wp.address, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                resolve({
                  lat: Number(result[0].y),
                  lng: Number(result[0].x),
                  title: wp.title || wp.address,
                });
              } else {
                console.warn("지오코딩 실패:", wp.address);
                resolve(null);
              }
            });
          });
        }
        return null;
      })
    ).then(arr => arr.filter(Boolean));
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const clear = () => {
      markersRef.current.forEach(m => m.setMap && m.setMap(null));
      markersRef.current = [];
      if (lineRef.current) { lineRef.current.setMap(null); lineRef.current = null; }
    };

    let canceled = false;
    (async () => {
      const kakao = await loadKakaoSdk().catch(() => null);
      if (!kakao || canceled) return;
      kakaoRef.current = kakao;

      clear();

      const routePts = normalizeRoutePoints()?.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)) || [];
      if (routePts.length < 2) {
        // 경로가 충분치 않으면 조용히 종료
        return;
      }

      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(routePts[0].lat, routePts[0].lng),
          level: 6,
        });
      }

      // 필요 시 커스텀 마커 이미지 연결
      // markerImageRef.current = new kakao.maps.MarkerImage(markerImg, new kakao.maps.Size(32,46));
      if (typeof markerImg === "string" && markerImg) {
        markerImageRef.current = new kakao.maps.MarkerImage(markerImg, new kakao.maps.Size(32, 46));
      } else {
        markerImageRef.current = null;
      }
      const { LatLng, LatLngBounds, Marker, Polyline } = kakao.maps;

      const path = routePts.map(p => new LatLng(p.lat, p.lng));
      lineRef.current = new Polyline({
        map: mapRef.current,
        path,
        strokeWeight: 5,
        strokeColor: "#34699A",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });

      // 시작/경유/종료 마커
      // const startLL = path[0];
      // const endLL = path[path.length - 1];

      // const startMarker = new Marker({
      //   map: mapRef.current,
      //   position: startLL,
      //   ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
      //   title: "출발",
      // });
      // const endMarker = new Marker({
      //   map: mapRef.current,
      //   position: endLL,
      //   ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
      //   title: "도착",
      // });

      const wpLLs = await geocodeIfNeeded(kakao, waypoints);
      const wpMarkers = wpLLs.map(wp => new Marker({
        map: mapRef.current,
        position: new LatLng(wp.lat, wp.lng),
        ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
        title: wp.title || "경유지"
      }));

      console.log(wpLLs);

      // markersRef.current = [startMarker, ...wpMarkers, endMarker];
      markersRef.current = [...wpMarkers];

      // 화면 맞춤
      const bounds = new LatLngBounds();
      path.forEach(ll => bounds.extend(ll));
      wpLLs.forEach(wp => bounds.extend(new LatLng(wp.lat, wp.lng)));
      mapRef.current.setBounds(bounds);

    })();

    return () => { canceled = true; clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef, expectedPolyline, expectedRoute, JSON.stringify(waypoints || [])]);
};

//폴리라인으로 지도 그리는 경량 유틸.
export const useStaticRouteMapFromPolyline = ({
  mapContainerRef,
  encodedPolyline,
  waypoints = [],
}) => {
  const mapRef = useRef(null);
  const lineRef = useRef(null);
  const kakaoRef = useRef(null);
  const markersRef = useRef([]);
  const markerImageRef = useRef(null);

  // Google Encoded Polyline 디코더
  const decodePolyline = (str) => {
    if (!str) return [];
    let index = 0, lat = 0, lng = 0;
    const pts = [];
    while (index < str.length) {
      let b, shift = 0, result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0; result = 0;
      do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      pts.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return pts.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  };

  // 주소 문자열 배열로 표준화
  const normalizeWaypointAddresses = (wps) => {
    if (!Array.isArray(wps)) return [];
    return wps
      .map(w => (typeof w === "string" ? w : (w?.address ?? "")))
      .map(s => (s || "").trim())
      .filter(Boolean);
  };

  // 마커/폴리라인 정리
  const clearOverlays = () => {
    if (lineRef.current) {
      lineRef.current.setMap(null);
      lineRef.current = null;
    }
    if (markersRef.current.length) {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    }
  };

  useEffect(() => {
    if (!mapContainerRef?.current) return;
    if (!encodedPolyline && (!waypoints || waypoints.length === 0)) return;

    let canceled = false;

    (async () => {
      // services 라이브러리 필수
      const kakao = await loadKakaoSdk().catch(() => null);
      if (!kakao || canceled) return;
      kakaoRef.current = kakao;

      const { LatLng, LatLngBounds, Polyline, Marker, InfoWindow } = kakao.maps;
      const geocoder = new kakao.maps.services.Geocoder();

      // 1) 기존 오버레이 제거
      clearOverlays();

      // 2) 경로 생성 (encodedPolyline → Polyline)
      const routePts = decodePolyline(encodedPolyline);
      const path = routePts.map(p => new LatLng(p.lat, p.lng));

      // 3) 지도 인스턴스 생성 (최초 1회)
      if (!mapRef.current) {
        const center = path[0] || new LatLng(37.5665, 126.9780); // fallback: 서울시청
        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 6,
        });
      }

      // 마커 이미지
      if (typeof markerImg === "string" && markerImg) {
        markerImageRef.current = new kakao.maps.MarkerImage(markerImg, new kakao.maps.Size(32, 46));
      } else {
        markerImageRef.current = null;
      }
      // 4) 폴리라인 그림 (있을 때만)
      if (path.length >= 2) {
        lineRef.current = new Polyline({
          map: mapRef.current,
          path,
          strokeWeight: 5,
          strokeColor: "#34699A",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
      }

      // 5) 경유지 주소 → 좌표 변환 후 마커
      const addresses = normalizeWaypointAddresses(waypoints);
      let waypointLatLngs = [];

      // addressSearch를 Promise로 래핑
      const geo = (addr) =>
        new Promise((resolve) => {
          geocoder.addressSearch(addr, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result?.[0]) {
              const { x, y } = result[0]; // x:lng, y:lat (문자열)
              resolve(new LatLng(Number(y), Number(x)));
            } else {
              resolve(null);
            }
          });
        });

      // geocode 순차 실행(과도한 동시요청 회피)
      for (let i = 0; i < addresses.length; i++) {
        if (canceled) return;
        const ll = await geo(addresses[i]);
        if (ll) waypointLatLngs.push(ll);

        // 마커 생성
        if (ll) {
          const marker = new Marker({
            map: mapRef.current,
            position: ll,
            ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
          });
          markersRef.current.push(marker);

          // 인포윈도우: 1,2,3... 순번/주소
          const iw = new InfoWindow({
            content: `
              <div style="padding:6px 10px; font-size:12px;">
                <b>${i + 1}번 경유지</b><br/>${addresses[i]}
              </div>
            `,
          });
          kakao.maps.event.addListener(marker, "click", () => {
            iw.open(mapRef.current, marker);
          });
        }
      }

      // 6) 화면 Bounds 맞춤: 폴리라인 + 마커 모두 포함
      const bounds = new LatLngBounds();
      let hasAny = false;

      if (path.length) {
        path.forEach(ll => { bounds.extend(ll); hasAny = true; });
      }
      if (waypointLatLngs.length) {
        waypointLatLngs.forEach(ll => { bounds.extend(ll); hasAny = true; });
      }

      if (hasAny) {
        mapRef.current.setBounds(bounds);
      } else if (path[0]) {
        mapRef.current.setCenter(path[0]);
      }

    })();

    return () => { canceled = true; clearOverlays(); };
    // encodedPolyline 또는 waypoints가 바뀌면 다시 그리기
  }, [mapContainerRef, encodedPolyline, JSON.stringify(waypoints)]);
};

async function geocodeAddresses(addresses) {
  const headers = { Authorization: `KakaoAK ${KAKAO_NAVIGATION_REST_KEY}` };
  const base = "https://dapi.kakao.com/v2/local/search/address.json"; // Kakao Local API
  const jobs = addresses.map(async (addr) => {
    const res = await axios.get(base, { headers, params: { query: addr } });
    const doc = res?.data?.documents?.[0];
    if (!doc) throw new Error(`지오코딩 실패: "${addr}"`);
    return { x: Number(doc.x), y: Number(doc.y), name: addr }; // x=lng, y=lat
  });
  return Promise.all(jobs);
}

// ---- 2) 직선거리 폴백 ----
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.y - a.y);
  const dLng = toRad(b.x - a.x);
  const lat1 = toRad(a.y), lat2 = toRad(b.y);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function sumStraightLineDistance(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += haversineMeters(points[i - 1], points[i]);
  return Math.round(sum);
}

// ---- 3) (x,y) 포인트들로 카카오모빌리티 길찾기 ----
async function fetchRouteDistanceFromPoints(points) {
  const headers = {
    Authorization: `KakaoAK ${KAKAO_NAVIGATION_REST_KEY}`,
    "Content-Type": "application/json",
  };
  const body = {
    origin: { x: points[0].x, y: points[0].y, name: points[0].name || "출발" },
    destination: { x: points.at(-1).x, y: points.at(-1).y, name: points.at(-1).name || "도착" },
    waypoints: points.slice(1, -1).map((p, i) => ({ x: p.x, y: p.y, name: p.name || `경유지${i + 1}` })),
    priority: "RECOMMEND",
    car_fuel: "GASOLINE",
    car_hipass: true,
    summary: true,              // 요약만(거리/시간) 응답 → 페이로드 절약
  };
  const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";
  const { data } = await axios.post(url, body, { headers });

  const distance = data?.routes?.[0]?.summary?.distance;
  if (typeof distance !== "number") return sumStraightLineDistance(points); // 폴백
  return Math.round(distance); // meters
}

export async function getRouteDistanceFromAddresses(addresses) {
  if (!Array.isArray(addresses) || addresses.length < 2) {
    throw new Error("최소 2개 이상의 주소가 필요합니다.");
  }

  const points = await geocodeAddresses(addresses);
  const distance = await fetchRouteDistanceFromPoints(points);

  return distance;
}