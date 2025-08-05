import { useRef } from "react";
import { useStaticRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";

const RouteMapComponent = ({startAddress, waypoints, endAddress, onRouteUpdate}) => {
    const mapRef = useRef(null);

    // 지도 생성 및 경로 표시 (커스텀 훅)
    useStaticRouteMap(mapRef, startAddress, waypoints, endAddress, onRouteUpdate);

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
            }}
        />
    );
};

export default RouteMapComponent;