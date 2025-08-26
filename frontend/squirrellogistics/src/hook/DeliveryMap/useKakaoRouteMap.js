import { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import markerImg from '../../pages/Driver/images/marker_blue.png';
import truckImg from '../../pages/Driver/images/truck.png';


//---------- 환경 상수 ----------.
//카카오 맵 API용 자바스크립트 키 (지도 렌더링용).
const KAKAO_JAVASCRIPT_KEY = "b6fc5753806ea3c0eb775a731ba0376b";
//카카오 맵 API용 REST API 키 (경로 추출용).
const KAKAO_NAVIGATION_REST_KEY = "a9b27d11d11d4f05e7134f9de285845d";
const API_SERVER_HOST = "http://localhost:8080";

//---------- 공용 카카오 SDK 로드 함수 ----------.
function loadKakaoSdk({ libraries } = {}) {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }
    //카카오 SDK스크립트 후주입.
    const script = document.createElement("script");
    const libs = libraries ? `&libraries=${libraries}` : "";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false${libs}`;
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
      const res = await axios.get(`${API_SERVER_HOST}/api/route/start`, {
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

    const { visited = [], expected = [], currentPosition } = route;
    if (!currentPosition || currentPosition.lat == null || currentPosition.lng == null) return; // ⭐

    const LatLng = kakao.maps.LatLng;

    // 좌표 정제: 숫자인 것만 남기기  // ⭐
    const toLL = (p) =>
      p && Number.isFinite(p.lat) && Number.isFinite(p.lng) ? new LatLng(p.lat, p.lng) : null;

    const visitedPath = visited.map(toLL).filter(Boolean);   // ⭐
    const expectedPath = expected.map(toLL).filter(Boolean); // ⭐
    const currentLatLng = toLL(currentPosition);
    if (!currentLatLng) return; // ⭐

    // 경로가 하나도 없을 수 있음 → endPt 만들기 전에 체크  // ⭐
    const endPt = expectedPath[expectedPath.length - 1] || visitedPath[visitedPath.length - 1] || null;

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

    // 마커 이미지: 소스가 있을 때만 생성  // ⭐
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

    // fitBounds: 경로가 1개 이상 있을 때만  // ⭐
    if (firstFitBoundsRef.current && (visitedPath.length + expectedPath.length) > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      [...visitedPath, ...expectedPath].forEach(p => bounds.extend(p));
      mapRef.current.setBounds(bounds);
      firstFitBoundsRef.current = false;
    }

    // end marker: endPt가 있을 때만  // ⭐
    if (endPt) {
      if (!endMarkerRef.current) {
        endMarkerRef.current = new kakao.maps.Marker({
          map: mapRef.current,
          position: endPt,
          ...(markerImageRef.current ? { image: markerImageRef.current } : {}), // ⭐
        });
      } else {
        endMarkerRef.current.setPosition(endPt);
        if (markerImageRef.current) endMarkerRef.current.setImage(markerImageRef.current);
      }
    } else if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null);
      endMarkerRef.current = null;
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
    if (!currentMarkerRef.current) {
      currentMarkerRef.current = new kakao.maps.Marker({
        map: mapRef.current,
        position: currentLatLng,
        ...(truckImageRef.current ? { image: truckImageRef.current } : {}), // ⭐
      });
    } else {
      currentMarkerRef.current.setPosition(currentLatLng);
      if (truckImageRef.current) currentMarkerRef.current.setImage(truckImageRef.current);
    }
  }, [route]);

  // 언마운트 정리
  useEffect(() => {
    return () => {
      const items = [
        visitedPolylineRef.current,
        expectedPolylineRef.current,
        currentMarkerRef.current,
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

  console.log("waypoints:", waypoints);
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
      const startLL = path[0];
      const endLL = path[path.length - 1];

      const startMarker = new Marker({
        map: mapRef.current,
        position: startLL,
        ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
        title: "출발",
      });
      const endMarker = new Marker({
        map: mapRef.current,
        position: endLL,
        ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
        title: "도착",
      });

      const wpLLs = await geocodeIfNeeded(kakao, waypoints);
      const wpMarkers = wpLLs.map(wp => new Marker({
        map: mapRef.current,
        position: new LatLng(wp.lat, wp.lng),
        ...(markerImageRef.current ? { image: markerImageRef.current } : {}),
        title: wp.title || "경유지"
      }));

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
}) => {
  const mapRef = useRef(null);
  const lineRef = useRef(null);
  const kakaoRef = useRef(null);

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

  useEffect(() => {
    if (!mapContainerRef.current || !encodedPolyline) return;

    console.log("useEffect: " + encodedPolyline);

    const clear = () => {
      if (lineRef.current) {
        lineRef.current.setMap(null);
        lineRef.current = null;
      }
    };

    let canceled = false;
    (async () => {
      const kakao = await loadKakaoSdk().catch(() => null);
      if (!kakao || canceled) return;
      kakaoRef.current = kakao;

      clear();

      const routePts = decodePolyline(encodedPolyline)?.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)) || [];
      if (routePts.length < 2) return;

      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(routePts[0].lat, routePts[0].lng),
          level: 6,
        });
      }

      const { LatLng, LatLngBounds, Polyline } = kakao.maps;

      const path = routePts.map(p => new LatLng(p.lat, p.lng));
      lineRef.current = new Polyline({
        map: mapRef.current,
        path,
        strokeWeight: 5,
        strokeColor: "#34699A",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });

      // 화면 맞춤
      const bounds = new LatLngBounds();
      path.forEach(ll => bounds.extend(ll));
      mapRef.current.setBounds(bounds);

    })();

    return () => { canceled = true; clear(); };
  }, [mapContainerRef, encodedPolyline]);
};