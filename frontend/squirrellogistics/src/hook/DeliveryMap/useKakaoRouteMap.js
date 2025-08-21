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
  encodedPolyline,          // string | null
  routePointsJSON,          // string(JSON) or array([{lat,lng}]) | null
  waypoints,                // [{ address?, lat?, lng?, title? }, ...]
  onRouteUpdate,            // (distanceMeters|null, durationMs|null) => void
}) => {
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const markerImageRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const onUpdateRef = useRef(onRouteUpdate);

  useEffect(() => {
    onUpdateRef.current = onRouteUpdate;
  }, [onRouteUpdate]);

  // --- Encoded polyline 디코더 (Google 방식) ---
  const decodePolyline = (str) => {
    let index = 0, lat = 0, lng = 0;
    const points = [];
    while (index < str.length) {
      let b, shift = 0, result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0; result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  };

  // routePointsJSON 정규화 → [{lat, lng}, ...] or null
  const normalizeRoutePoints = () => {
    if (encodedPolyline && encodedPolyline.trim().length > 0) {
      try {
        return decodePolyline(encodedPolyline.trim());
      } catch (e) {
        console.warn("encodedPolyline decode 실패 → routePointsJSON 사용 시도", e);
      }
    }
    if (!routePointsJSON) return null;

    try {
      if (typeof routePointsJSON === "string") {
        const arr = JSON.parse(routePointsJSON);
        return Array.isArray(arr) ? arr : null;
      }
      if (Array.isArray(routePointsJSON)) return routePointsJSON;
    } catch (e) {
      console.error("routePointsJSON 파싱 실패:", e);
    }
    return null;
  };

  // 좌표가 있는 waypoint만 추출
  const getWaypointLatLngs = () => {
    const list = waypoints || [];
    return list
      .filter(wp => typeof wp.lat === "number" && typeof wp.lng === "number")
      .map(wp => ({ lat: wp.lat, lng: wp.lng, title: wp.title || wp.address }));
  };

  // 좌표 없는 waypoint는 필요 시 주소 지오코딩
  const geocodeIfNeeded = (kakao, wps) =>
    Promise.all(
      (wps || []).map(async (wp) => {
        if (typeof wp.lat === "number" && typeof wp.lng === "number") {
          return { lat: wp.lat, lng: wp.lng, title: wp.title || wp.address };
        }
        if (!wp.address) return null;
        if (!geocoderRef.current) geocoderRef.current = new kakao.maps.services.Geocoder();

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
      })
    ).then(arr => arr.filter(Boolean));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const clearMapObjects = () => {
      markersRef.current.forEach(m => m.setMap && m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };

    const draw = async (kakao) => {
      try {
        clearMapObjects();

        const routePoints = normalizeRoutePoints();
        if (!routePoints || routePoints.length < 2) {
          console.error("경로 좌표가 부족합니다. encodedPolyline 또는 routePointsJSON 확인");
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(
            mapContainerRef.current,
            { center: new kakao.maps.LatLng(routePoints[0].lat, routePoints[0].lng), level: 6 }
          );
        }
        if (!markerImageRef.current) {
          markerImageRef.current = new kakao.maps.MarkerImage(
            markerImg,
            new kakao.maps.Size(32, 46)
          );
        }

        // --- 마커: 출발/경유지/도착 ---
        const LatLng = kakao.maps.LatLng;
        const startLL = new LatLng(routePoints[0].lat, routePoints[0].lng);
        const endLL = new LatLng(routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng);

        let waypointLLs = getWaypointLatLngs();
        if (waypointLLs.length === 0 && (waypoints && waypoints.some(w => w.address))) {
          waypointLLs = await geocodeIfNeeded(kakao, waypoints);
        }

        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(startLL);
        waypointLLs.forEach(wp => bounds.extend(new LatLng(wp.lat, wp.lng)));
        bounds.extend(endLL);
        mapRef.current.setBounds(bounds);

        const startMarker = new kakao.maps.Marker({
          map: mapRef.current,
          position: startLL,
          image: markerImageRef.current,
          title: "출발",
        });
        const endMarker = new kakao.maps.Marker({
          map: mapRef.current,
          position: endLL,
          image: markerImageRef.current,
          title: "도착",
        });
        const wpMarkers = waypointLLs.map(wp =>
          new kakao.maps.Marker({
            map: mapRef.current,
            position: new LatLng(wp.lat, wp.lng),
            image: markerImageRef.current,
            title: wp.title || "경유지",
          })
        );
        markersRef.current = [startMarker, ...wpMarkers, endMarker];

        // --- 경로(Polyline) ---
        const path = routePoints.map(p => new LatLng(p.lat, p.lng));
        polylineRef.current = new kakao.maps.Polyline({
          map: mapRef.current,
          path,
          strokeWeight: 5,
          strokeColor: "#34699A",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });

        // 거리/시간은 서버 계산값 사용 권장 → 여기서는 null 전달
        if (onUpdateRef.current) onUpdateRef.current(null, null);
      } catch (e) {
        console.error("경로 렌더링 실패:", e);
      }
    };

    loadKakaoSdk({ libraries: "services" })
      .then(kakao => draw(kakao))
      .catch(e => console.error("카카오맵 SDK 로딩 실패:", e));

    return () => clearMapObjects();
    // deps: 주요 입력이 바뀔 때만 재렌더
  }, [mapContainerRef, encodedPolyline, routePointsJSON, JSON.stringify(waypoints || [])]);
};