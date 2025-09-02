import { useRef } from "react";
import { useKakaoRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";
import './LiveMapComponent.css';

const LiveMapComponent = ({ route }) => {
    const mapRef = useRef(null);

    // 지도 생성 및 경로 표시 (커스텀 훅)
    useKakaoRouteMap(mapRef, route);

    const outOfWay = !!route?.outOfWay; 
    const deviation = Math.round(route?.deviationMeters ?? 0);

     return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {outOfWay && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#d32f2f',          // 빨강
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
            zIndex: 9999,
            pointerEvents: 'none',          // 지도 인터랙션 막지 않음
            letterSpacing: 0.2,
          }}
        >
          ⚠️ 경로 이탈 감지됨{deviation > 0 ? ` • 약 ${deviation}m` : ''}
        </div>
      )}
    </div>
  );
};

export default LiveMapComponent;