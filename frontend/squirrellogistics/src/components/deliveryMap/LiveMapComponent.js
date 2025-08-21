import { useRef } from "react";
import { useKakaoRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";
import './LiveMapComponent.css';

const LiveMapComponent = ({ route }) => {
    const mapRef = useRef(null);

    // 지도 생성 및 경로 표시 (커스텀 훅)
    useKakaoRouteMap(mapRef, route);

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

export default LiveMapComponent;