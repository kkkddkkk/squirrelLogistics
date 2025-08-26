/* global kakao */
import React, { useEffect } from "react";

const DeliveryRouteMap = ({ locations }) => {
  useEffect(() => {
    const loadMap = () => {
      console.log("DeliveryRouteMap - locations:", locations);

      const container = document.getElementById("kakao-map");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 7,
      };

      const map = new window.kakao.maps.Map(container, options);
      const geocoder = new window.kakao.maps.services.Geocoder();
      const points = [];
      const markers = [];

      const geocodeAddress = (address, idx, callback) => {
        console.log(`지오코딩 시작: ${address}`);

        // 주소 정규화 (더 정확한 지오코딩을 위해)
        let normalizedAddress = address;
        if (address.includes("서초대로 456")) {
          normalizedAddress = "서울특별시 서초구 서초대로 456";
        } else if (address.includes("테헤란로 123")) {
          normalizedAddress = "서울특별시 강남구 테헤란로 123";
        }

        geocoder.addressSearch(normalizedAddress, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            points[idx] = coords;
            console.log(
              `지오코딩 성공: ${address} -> ${coords.getLat()}, ${coords.getLng()}`
            );

            const marker = new window.kakao.maps.Marker({
              map,
              position: coords,
              title: address,
            });
            markers.push(marker);

            callback();
          } else {
            console.error(`지오코딩 실패: ${address}, status: ${status}`);
            // 지오코딩 실패 시 주소에 따른 적절한 기본 좌표 사용
            let defaultCoords;
            if (address.includes("서초구")) {
              // 서초구 기본 좌표
              defaultCoords = new window.kakao.maps.LatLng(37.4837, 127.0324);
            } else if (address.includes("강남구")) {
              // 강남구 기본 좌표
              defaultCoords = new window.kakao.maps.LatLng(37.5172, 127.0473);
            } else {
              // 기타 지역은 서울 시청
              defaultCoords = new window.kakao.maps.LatLng(37.5665, 126.978);
            }
            points[idx] = defaultCoords;

            const marker = new window.kakao.maps.Marker({
              map,
              position: defaultCoords,
              title: `${address} (지오코딩 실패)`,
            });
            markers.push(marker);

            callback();
          }
        });
      };

      let completed = 0;
      const totalLocations = locations.length;

      if (totalLocations === 0) {
        console.warn("locations가 비어있습니다.");
        return;
      }

      locations.forEach((loc, idx) => {
        if (!loc || loc.trim() === "") {
          console.warn(`빈 주소 발견: index ${idx}`);
          completed++;
          if (completed === totalLocations) {
            drawPolyline();
          }
          return;
        }

        geocodeAddress(loc, idx, () => {
          completed++;
          console.log(`지오코딩 완료: ${completed}/${totalLocations}`);
          if (completed === totalLocations) {
            drawPolyline();
          }
        });
      });

      const drawPolyline = () => {
        const validPoints = points.filter((p) => p !== undefined && p !== null);
        console.log("유효한 좌표들:", validPoints.length);

        if (validPoints.length >= 2) {
          const polyline = new window.kakao.maps.Polyline({
            path: validPoints,
            strokeWeight: 5,
            strokeColor: "#113F67",
            strokeOpacity: 0.8,
            strokeStyle: "solid",
          });
          polyline.setMap(map);

          // 모든 마커가 보이도록 지도 범위 조정
          const bounds = new window.kakao.maps.LatLngBounds();
          validPoints.forEach((point) => bounds.extend(point));
          map.setBounds(bounds);

          console.log("폴리라인 그리기 완료");
        } else {
          console.error("폴리라인을 그리기 위한 충분한 좌표가 없습니다.");
          if (validPoints.length === 1) {
            map.setCenter(validPoints[0]);
          }
        }
      };
    };

    if (window.kakao?.maps) {
      loadMap();
    } else {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
      // SDK 로딩 재시도
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=b6fc5753806ea3c0eb775a731ba0376b&libraries=services";
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log("Kakao Maps SDK 로딩 완료");
          loadMap();
        });
      };
      script.onerror = () => {
        console.error("Kakao Maps SDK 로딩 실패");
      };
      document.head.appendChild(script);
    }
  }, [locations]);

  return (
    <div
      id="kakao-map"
      style={{ width: "100%", height: "100%", borderRadius: "8px" }}
    ></div>
  );
};

export default DeliveryRouteMap;
