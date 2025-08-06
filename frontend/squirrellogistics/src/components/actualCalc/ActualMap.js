import { Box } from "@mui/material";
import { useRef, useEffect } from "react";
import { useKakaoRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";
//카카오 맵 API용 자바스크립트 키 (지도 렌더링용).
const KAKAO_JAVASCRIPT_KEY = "b6fc5753806ea3c0eb775a731ba0376b";

//카카오 맵 API용 REST API 키 (경로 추출용).
const KAKAO_NAVIGATION_REST_KEY = "a9b27d11d11d4f05e7134f9de285845d";
const ActualMap = () => {


    const mapRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                    level: 10,
                });
                const pathCoords = [
                    [126.8963, 37.5250], // 출발지: 영등포구청
                    [126.9396, 37.5124], // 경유지: 동작구청
                    [127.0474, 37.5173]  // 도착지: 강남구청
                ];

                const linePath = pathCoords.map(
                    ([lng, lat]) => new window.kakao.maps.LatLng(lat, lng)
                );

                const polyline = new window.kakao.maps.Polyline({
                    path: linePath,
                    strokeWeight: 5,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.7,
                    strokeStyle: "solid"
                });

                polyline.setMap(map);
            });
        };

        document.head.appendChild(script);
    }, []);



    return (
        <div style={{
            width: "35%",
            marginLeft: "10%",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            position: 'fixed',
        }}>
            <div
                id="map"
                style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    border: "1px solid #2A2A2A"
                }}
                ref={mapRef}
            ></div>
            <div
                style={{
                    width: "100%", borderBottom: "1px solid #2A2A2A",
                    borderLeft: "1px solid #2A2A2A", borderRight: "1px solid #2A2A2A"
                }}
            >
                <div style={{ width: "49%", display: "inline-block", borderRight: "1px solid #2A2A2A" }}>출발시간: </div>
                <div style={{ width: "50%", display: "inline-block" }}>도착시간: </div>

            </div>
        </div>


    )
}

export default ActualMap;