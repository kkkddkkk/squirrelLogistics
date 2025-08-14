import { useRef } from "react";
import { useStaticRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";


const RouteMapComponent = ({ routes, polyline, waypoints, onRouteUpdate }) => {
    const mapRef = useRef(null);
    useStaticRouteMap({
        mapContainerRef: mapRef,
        encodedPolyline: polyline,
        routePointsJSON: routes,
        waypoints,
        onRouteUpdate,
    });

    return (
        <div
            ref={mapRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
        />
    );
};

export default RouteMapComponent;