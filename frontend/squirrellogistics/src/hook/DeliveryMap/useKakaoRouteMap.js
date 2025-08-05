import { useCallback, useEffect } from "react";
import axios from "axios";

//카카오 맵 API용 자바스크립트 키 (지도 렌더링용).
const KAKAO_JAVASCRIPT_KEY = "b6fc5753806ea3c0eb775a731ba0376b";

//카카오 맵 API용 REST API 키 (경로 추출용).
const KAKAO_NAVIGATION_REST_KEY = "a9b27d11d11d4f05e7134f9de285845d";

const API_SERVER_HOST = "http://localhost:8080";


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

// export const useKakaoRouteMap = (mapRef, driverId) => {
//     useEffect(() => {
//         const drawRouteFromBackend = async () => {
//             const container = mapRef.current;

//             const map = new window.kakao.maps.Map(container, {
//                 center: new window.kakao.maps.LatLng(37.5665, 126.9780),
//                 level: 5,
//             });

//             try {
//                 const res = await axios.get(`${API_SERVER_HOST}/api/route/live?driverId=${driverId}`);
//                 const { polyline, currentPosition } = res.data;

//                 // 📍출발~도착 경로 표시 (폴리라인)
//                 const linePath = polyline.map(p => new window.kakao.maps.LatLng(p.lat, p.lng));
//                 const polylineObj = new window.kakao.maps.Polyline({
//                     path: linePath,
//                     strokeWeight: 5,
//                     strokeColor: "#ff0000ff",
//                     strokeOpacity: 0.9,
//                     strokeStyle: "solid",
//                 });
//                 polylineObj.setMap(map);

//                 // 📍현재 위치 오버레이 표시
//                 const overlayDiv = document.createElement("div");
//                 overlayDiv.className = "live-map-pulse-circle";
//                 const customOverlay = new window.kakao.maps.CustomOverlay({
//                     content: overlayDiv,
//                     position: new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng),
//                     yAnchor: 0.5,
//                     xAnchor: 0.5,
//                 });
//                 customOverlay.setMap(map);

//                 // 📍지도 영역 맞추기
//                 const bounds = new window.kakao.maps.LatLngBounds();
//                 linePath.forEach(p => bounds.extend(p));
//                 bounds.extend(new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng));
//                 map.setBounds(bounds);
//             } catch (err) {
//                 console.error("경로 로딩 실패:", err);
//             }
//         };

//         const loadKakaoMap = () => {
//             if (window.kakao && window.kakao.maps) {
//                 window.kakao.maps.load(drawRouteFromBackend);
//             } else {
//                 const script = document.createElement("script");
//                 script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false`;
//                 script.async = true;
//                 script.onload = () => window.kakao.maps.load(drawRouteFromBackend);
//                 document.head.appendChild(script);
//                 return () => document.head.removeChild(script);
//             }
//         };

//         loadKakaoMap();
//     }, [mapRef, driverId]);
// };

export const useKakaoRouteMap = (mapRef, driverId, onRouteUpdate) => {
    useEffect(() => {
        if (!mapRef.current) return;

        let map = null;
        let visitedPolyline = null;
        let expectedPolyline = null;
        let currentMarker = null;
        let currentPulse = null;
        let endMarker = null;
        let interval;
        let isFirstRender = true; // ✅ 최초 렌더링 여부 플래그

        const loadKakaoMapScript = () => {
            return new Promise((resolve) => {
                if (window.kakao && window.kakao.maps) {
                    resolve();
                } else {
                    const script = document.createElement("script");
                    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false`;
                    script.async = true;
                    script.onload = () => {
                        window.kakao.maps.load(resolve);
                    };
                    document.head.appendChild(script);
                }
            });
        };

        const fetchRouteAndRender = async () => {
            try {
                const res = await axios.get(`${API_SERVER_HOST}/api/route/live`, {
                    params: { driverId }
                });

                const { visited, expected, currentPosition, distance, duration } = res.data;
                if (!visited || !expected || !currentPosition) {
                    console.warn("응답 데이터 부족:", res.data);
                    return;
                }

                if (typeof onRouteUpdate === 'function') {
                    onRouteUpdate(distance, duration);
                }

                const currentLatLng = new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
                const finalDestination = expected[expected.length - 1] || visited[visited.length - 1];
                const endLatLng = new window.kakao.maps.LatLng(finalDestination.lat, finalDestination.lng);

                if (!map) {
                    map = new window.kakao.maps.Map(mapRef.current, {
                        center: currentLatLng,
                        level: 5,
                    });
                }

                // 기존 경로 제거
                if (visitedPolyline) visitedPolyline.setMap(null);
                if (expectedPolyline) expectedPolyline.setMap(null);

                // visited (회색 실선)
                visitedPolyline = new window.kakao.maps.Polyline({
                    path: visited.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
                    strokeWeight: 4,
                    strokeColor: "#999",
                    strokeOpacity: 0.8,
                    strokeStyle: "solid"
                });
                visitedPolyline.setMap(map);

                // expected (붉은 실선)
                expectedPolyline = new window.kakao.maps.Polyline({
                    path: expected.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
                    strokeWeight: 4,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeStyle: "solid"
                });
                expectedPolyline.setMap(map);

                // ✅ 최초 1회에만 지도 영역 맞춤
                if (isFirstRender) {
                    const bounds = new window.kakao.maps.LatLngBounds();
                    [...visited, ...expected].forEach(p =>
                        bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng))
                    );
                    map.setBounds(bounds);
                    isFirstRender = false;
                }

                // 도착 마커 (고정)
                if (!endMarker) {
                    endMarker = new window.kakao.maps.Marker({
                        map,
                        position: endLatLng
                    });
                }

                // 1. 펄스 애니메이션용 div
                const pulseDiv = document.createElement('div');
                pulseDiv.className = 'live-map-pulse-circle';

                // 2. 커스텀 오버레이 (애니메이션용)
                if (!currentPulse) {
                    currentPulse = new window.kakao.maps.CustomOverlay({
                        map,
                        position: currentLatLng,
                        content: pulseDiv,
                        yAnchor: 0.5,
                        xAnchor: 0.5
                    });
                } else {
                    currentPulse.setPosition(currentLatLng);
                }

                // 3. 실제 마커
                if (!currentMarker) {
                    currentMarker = new window.kakao.maps.Marker({
                        map,
                        position: currentLatLng
                    });
                } else {
                    currentMarker.setPosition(currentLatLng);
                }
            } catch (err) {
                console.error("경로 요청 실패:", err);
            }
        };

        loadKakaoMapScript()
            .then(() => {
                fetchRouteAndRender();
                interval = setInterval(fetchRouteAndRender, 3000);
            })
            .catch((err) => {
                console.error("카카오맵 SDK 로딩 실패", err);
            });

        return () => clearInterval(interval);
    }, [mapRef, driverId]);
};

export const useStaticRouteMap = (mapRef, startAddress, waypoints, endAddress, onRouteUpdate) => {
    useEffect(() => {
        if (!mapRef.current) return;

        let map = null;
        let geocoder = null;

        const loadKakaoMapScript = () => {
            console.log("loadKakaoMapScript");

            return new Promise((resolve) => {
                if (window.kakao && window.kakao.maps) {
                    console.log("11111");

                    resolve();
                } else {
                    console.log("22222");

                    const script = document.createElement("script");
                    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=b6fc5753806ea3c0eb775a731ba0376b&autoload=false&libraries=services`;
                    script.async = true;
                    script.onload = () => window.kakao.maps.load(resolve);
                    document.head.appendChild(script);
                }
            });
        };

        const getCoords = (address) => {
            console.log("getCoords");

            return new Promise((resolve, reject) => {
                console.log("주소 변환 시도:", address);
                geocoder.addressSearch(address, (result, status) => {
                    console.log("주소 변환 결과:", status, result);
                    if (status === window.kakao.maps.services.Status.OK) {
                        console.log("hello2");

                        resolve({
                            name: address,
                            x: result[0].x,
                            y: result[0].y,
                            latlng: new window.kakao.maps.LatLng(result[0].y, result[0].x)
                        });
                    } else {
                        reject(`주소 변환 실패: ${address}`);
                    }
                });
            });
        };

        const fetchRouteFromKakaoMobility = async (coords) => {
            console.log("fetchRouteFromKakaoMobility");

            const origin = `${coords[0].x},${coords[0].y}`;
            const destination = `${coords[coords.length - 1].x},${coords[coords.length - 1].y}`;
            const waypoints = coords.length > 2
                ? coords.slice(1, -1).map(c => `${c.x},${c.y}`).join("|")
                : null;

            let url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}`;
            if (waypoints) {
                url += `&waypoints=${encodeURIComponent(waypoints)}`;
            }

            const headers = {
                Authorization: `KakaoAK ${KAKAO_NAVIGATION_REST_KEY}`
            };

            const response = await axios.get(url, { headers });
            const route = response.data.routes[0];

            if (typeof onRouteUpdate === 'function') {
                onRouteUpdate(route.summary.distance, route.summary.duration);
            }

            return route.sections.flatMap(section =>
                section.roads.flatMap(road =>
                    road.vertexes.reduce((acc, cur, idx, arr) => {
                        if (idx % 2 === 0) acc.push(new window.kakao.maps.LatLng(arr[idx + 1], arr[idx]));
                        return acc;
                    }, [])
                )
            );
        };

        const drawRoute = async () => {
            console.log("drawRoute");

            try {
                const allAddresses = [startAddress, ...waypoints, endAddress];
                const coords = await Promise.all(allAddresses.map(getCoords));

                map = new window.kakao.maps.Map(mapRef.current, {
                    center: coords[0].latlng,
                    level: 5
                });

                const bounds = new window.kakao.maps.LatLngBounds();
                coords.forEach(coord => bounds.extend(coord.latlng));
                map.setBounds(bounds);

                coords.forEach((coord, idx) => {
                    new window.kakao.maps.Marker({
                        map,
                        position: coord.latlng,
                        title: coord.name
                    });
                });

                const polylinePath = await fetchRouteFromKakaoMobility(coords);

                new window.kakao.maps.Polyline({
                    map,
                    path: polylinePath,
                    strokeWeight: 4,
                    strokeColor: "#FF3B30",
                    strokeOpacity: 0.9,
                    strokeStyle: "solid"
                });
            } catch (err) {
                console.error("경로 렌더링 실패:", err);
            }
        };

        loadKakaoMapScript()
            .then(() => {
                console.log("loadKakaoMapScript 성공!");

                geocoder = new window.kakao.maps.services.Geocoder();
                console.log("geocoder: " + geocoder);

                drawRoute();
            })
            .catch((err) => {
                console.error("카카오맵 SDK 로딩 실패:", err);
            });
    }, [mapRef, startAddress, waypoints, endAddress]);
};