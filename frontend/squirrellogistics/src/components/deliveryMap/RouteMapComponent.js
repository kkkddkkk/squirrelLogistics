import { useRef } from "react";
import { useStaticRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";


const RouteMapComponent = ({ expectedRoute, expectedPolyline, waypoints }) => {
    const mapRef = useRef(null);
    useStaticRouteMap({
        mapContainerRef:mapRef,
        expectedRoute,
        expectedPolyline,
        waypoints
    });

    return (
        <div
            ref={mapRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
        />
    );
};

export default RouteMapComponent;