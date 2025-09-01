import { useRef } from "react";
import { useStaticRouteMapFromPolyline } from "../../hook/DeliveryMap/useKakaoRouteMap";

const PolylineMapComponent = ({ polyline, waypoints}) => {

    const mapRef = useRef(null);

    useStaticRouteMapFromPolyline({
        mapContainerRef: mapRef,
        encodedPolyline: polyline,
        waypoints: waypoints
    });

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
}
export default PolylineMapComponent;