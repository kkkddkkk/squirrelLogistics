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
export const useKakaoRouteMap = (mapContainerRef, driverId, onRouteUpdate) => {

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
    const intervalRef = useRef(null);
    const firstFitBoundsRef = useRef(true);

    useEffect(() => {

        if (!mapContainerRef.current) return;

        //지도, 라인, 마커 렌더링.
        const fetchRouteAndRender = async (kakao) => {
            try {
                const { data } = await axios.get(`${API_SERVER_HOST}/api/route/live`, { params: { driverId } });
                const { visited, expected, currentPosition, distance, duration } = data || {};
                if (!visited || !expected || !currentPosition) return;

                //컴포넌트로 갈 외부 콜백 연결 => 거리, 시간 갱신.
                if (typeof onRouteUpdate === "function") onRouteUpdate(distance, duration);

                const LatLng = kakao.maps.LatLng;

                const currentLatLng = new LatLng(currentPosition.lat, currentPosition.lng);
                const finalPt = expected[expected.length - 1] || visited[visited.length - 1];
                const endLatLng = new LatLng(finalPt.lat, finalPt.lng);

                //지도 인스턴스 생성.
                if (!mapRef.current) {
                    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
                        center: currentLatLng,
                        level: 5,
                    });

                    //마커 이미지 생성, 등록 경로의 이미지로 크기 설정.
                    markerImageRef.current = new kakao.maps.MarkerImage(
                        markerImg,
                        new kakao.maps.Size(32, 46)
                    );
                    truckImageRef.current = new kakao.maps.MarkerImage(
                        truckImg,
                        new kakao.maps.Size(45, 25)
                    );
                }

                //이미 지나온 경로 표시 => 회색(임시).
                if (!visitedPolylineRef.current) {
                    visitedPolylineRef.current = new kakao.maps.Polyline({
                        map: mapRef.current,
                        path: visited.map((p) => new LatLng(p.lat, p.lng)),
                        strokeWeight: 4,
                        strokeColor: "#999",
                        strokeOpacity: 0.8,
                        strokeStyle: "solid",
                    });
                } else {
                    visitedPolylineRef.current.setPath(visited.map((p) => new LatLng(p.lat, p.lng)));
                }

                //앞으로 진행할 경로 표시 => 진한 군청색(임시).
                if (!expectedPolylineRef.current) {
                    expectedPolylineRef.current = new kakao.maps.Polyline({
                        map: mapRef.current,
                        path: expected.map((p) => new LatLng(p.lat, p.lng)),
                        strokeWeight: 4,
                        strokeColor: "#113F67",
                        strokeOpacity: 0.8,
                        strokeStyle: "solid",
                    });
                } else {
                    expectedPolylineRef.current.setPath(expected.map((p) => new LatLng(p.lat, p.lng)));
                }

                //전체 경로가 보이도록 영역 bounds 수정(계속 변경되면 정신 없어서 1회). 
                if (firstFitBoundsRef.current) {
                    const bounds = new kakao.maps.LatLngBounds();
                    [...visited, ...expected].forEach((p) => bounds.extend(new LatLng(p.lat, p.lng)));
                    mapRef.current.setBounds(bounds);
                    firstFitBoundsRef.current = false;
                }

                //도착 목적지 마커 표시.
                if (!endMarkerRef.current) {
                    endMarkerRef.current = new kakao.maps.Marker({
                        map: mapRef.current,
                        position: endLatLng,
                        image: markerImageRef.current || undefined,
                    });
                } else {
                    endMarkerRef.current.setPosition(endLatLng);
                }

                //현재 위치 연출용 커스텀 오버레이.
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

                //기사 현재 위치 마커 표시.
                if (!currentMarkerRef.current) {
                    currentMarkerRef.current = new kakao.maps.Marker({
                        map: mapRef.current,
                        position: currentLatLng,
                        image: truckImageRef.current || undefined,
                    });
                } else {
                    currentMarkerRef.current.setPosition(currentLatLng);
                }
            } catch (err) {
                console.error("경로 요청 실패:", err);
            }
        };

        //(임시) 3초 폴링 구조 => 추후 websocket 구독 구조로 수정 예정.
        loadKakaoSdk()
            .then((kakao) => {
                fetchRouteAndRender(kakao);
                //3초마다 갱신.
                intervalRef.current = setInterval(() => fetchRouteAndRender(kakao), 3000);
            })
            .catch((e) => console.error("카카오맵 SDK 로딩 실패:", e));

        //인터벌 제거, 마커 정리.
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            const items = [
                visitedPolylineRef.current,
                expectedPolylineRef.current,
                currentMarkerRef.current,
                endMarkerRef.current,
                pulseOverlayRef.current,
            ];
            items.forEach((it) => it && it.setMap && it.setMap(null));
        };
    }, [mapContainerRef, driverId, onRouteUpdate]);
};

//---------- <정적/고정> 지도 훅 ----------.
export const useStaticRouteMap = (
    mapContainerRef,
    startAddress,
    waypoints,
    endAddress,
    onRouteUpdate
) => {

    //카카오 객체들을 useRef로 보관.
    const mapRef = useRef(null);
    const geocoderRef = useRef(null);
    const markerImageRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);

    //onRouteUpdate ref에 보관, deps에서 제외(고정 지도 재렌더링 제한).
    const onUpdateRef = useRef(onRouteUpdate);
    useEffect(() => {
        onUpdateRef.current = onRouteUpdate;
    }, [onRouteUpdate]);

    //waypoints를 내용 기반 키로 고정, deps에서 제외(고정 지도 재렌더링 제한).
    const waypointsKey = JSON.stringify(
        (waypoints || []).map(w => ({ address: w.address }))
    );

    //랜더링.
    useEffect(() => {
        if (!mapContainerRef.current) return;

        //카카오 지도 관련 오브젝트 정리 함수.
        const clearMapObjects = () => {
            markersRef.current.forEach(m => m.setMap && m.setMap(null));
            markersRef.current = [];
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };

        //문자열 주소 => 좌표로 변환 함수.
        const getCoords = (kakao, address) =>
            new Promise((resolve, reject) => {
                if (!geocoderRef.current) {
                    geocoderRef.current = new kakao.maps.services.Geocoder();
                }
                geocoderRef.current.addressSearch(address, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        resolve({
                            name: address,
                            x: result[0].x,
                            y: result[0].y,
                            latlng: new kakao.maps.LatLng(result[0].y, result[0].x),
                        });
                    } else {
                        reject(new Error(`주소 변환 실패: ${address}`));
                    }
                });
            });

        //카카오모빌리티 길찾기 API 호출, 폴리라인 좌표 변환.
        const fetchRouteFromKakaoMobility = async (kakao, coords) => {
            const origin = `${coords[0].x},${coords[0].y}`;
            const destination = `${coords[coords.length - 1].x},${coords[coords.length - 1].y}`;
            const wp =
                coords.length > 2
                    ? coords.slice(1, -1).map(c => `${c.x},${c.y}`).join("|")
                    : null;

            let url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}`;
            if (wp) url += `&waypoints=${encodeURIComponent(wp)}`;

            const headers = { Authorization: `KakaoAK ${KAKAO_NAVIGATION_REST_KEY}` };
            const { data } = await axios.get(url, { headers });

            const route = data.routes?.[0];
            if (!route) throw new Error("경로 없음");

            //거리,시간 업데이트.
            onUpdateRef.current?.(route.summary.distance, route.summary.duration);

            const LatLng = kakao.maps.LatLng;
            //vertexes[x1,y1, x2,y2, ...] => LatLng 배열로 전환.
            return route.sections.flatMap(section =>
                section.roads.flatMap(road =>
                    road.vertexes.reduce((acc, cur, idx, arr) => {
                        if (idx % 2 === 0) acc.push(new LatLng(arr[idx + 1], arr[idx]));
                        return acc;
                    }, [])
                )
            );
        };

        //전체 지도 그리기.
        const draw = async (kakao) => {
            try {
                clearMapObjects();

                if (!mapRef.current) {
                    mapRef.current = new kakao.maps.Map(
                        mapContainerRef.current,
                        { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 }
                    );
                }
                if (!markerImageRef.current) {
                    markerImageRef.current = new kakao.maps.MarkerImage(
                        markerImg,
                        new kakao.maps.Size(32, 46)
                    );
                }

                const allAddresses = [
                    startAddress,
                    ...(JSON.parse(waypointsKey) || []).map(w => w.address),
                    endAddress,
                ].filter(Boolean);

                const coords = await Promise.all(
                    allAddresses.map(addr => getCoords(kakao, addr))
                );

                //지도 영역을 마커 잘 보이게 맞춤.
                const bounds = new kakao.maps.LatLngBounds();
                coords.forEach(c => bounds.extend(c.latlng));
                mapRef.current.setBounds(bounds);

                markersRef.current = coords.map(c =>
                    new kakao.maps.Marker({
                        map: mapRef.current,
                        position: c.latlng,
                        image: markerImageRef.current,
                        title: c.name,
                    })
                );

                //길찾기 폴리라인 그리기.
                const path = await fetchRouteFromKakaoMobility(kakao, coords);
                polylineRef.current = new kakao.maps.Polyline({
                    map: mapRef.current,
                    path,
                    strokeWeight: 5,
                    strokeColor: "#34699A",
                    strokeOpacity: 0.9,
                    strokeStyle: "solid",
                });
            } catch (e) {
                console.error("경로 렌더링 실패:", e);
            }
        };

        //카카오 SDK 로드 후 draw.
        loadKakaoSdk({ libraries: "services" })
            .then(kakao => draw(kakao))
            .catch(e => console.error("카카오맵 SDK 로딩 실패:", e));

        //언마운트 혹은 deps 변경 시 지도 관련 객체들 정리.
        return () => clearMapObjects();

    }, [mapContainerRef, startAddress, endAddress, waypointsKey]);

};