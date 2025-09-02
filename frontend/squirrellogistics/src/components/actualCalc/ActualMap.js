import { Box } from "@mui/material";
import { useRef, useEffect } from "react";
import { useStaticRouteMapFromPolyline } from "../../hook/DeliveryMap/useKakaoRouteMap";
// import { useStaticRouteMapFromPolyline } from "../../hook/DeliveryMap/useKakaoRouteMap";
//카카오 맵 API용 자바스크립트 키 (지도 렌더링용).
const KAKAO_JAVASCRIPT_KEY = "b6fc5753806ea3c0eb775a731ba0376b";

//카카오 맵 API용 REST API 키 (경로 추출용).
const KAKAO_NAVIGATION_REST_KEY = "a9b27d11d11d4f05e7134f9de285845d";
const ActualMap = ({ polyline }) => {

    const mapRef = useRef(null);

    useStaticRouteMapFromPolyline({
        mapContainerRef: mapRef,
        encodedPolyline: polyline,
    });

    return (
        <div style={{
            width: "100%",
            height: "65vh",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
        }}>
            <div
                id="map"
                style={{
                    width: "100%",
                    height: "100%",
                }}
                ref={mapRef}
            ></div>
        </div>
    )
}

export default ActualMap;