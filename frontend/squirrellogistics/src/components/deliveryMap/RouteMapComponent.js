import { useRef } from "react";
import { useStaticRouteMap } from "../../hook/DeliveryMap/useKakaoRouteMap";


const RouteMapComponent = ({ routes, polyline, waypoints }) => {
    const mapRef = useRef(null);
    useStaticRouteMap({
        mapContainerRef: mapRef,
        encodedPolyline: polyline,
        routePointsJSON: routes,
        waypoints,
    });

    return (
        <div
            ref={mapRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
        />
    );
};

export default RouteMapComponent;