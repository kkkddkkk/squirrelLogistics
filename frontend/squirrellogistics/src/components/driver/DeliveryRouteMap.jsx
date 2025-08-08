/* global kakao */
import React, { useEffect } from "react";

const DeliveryRouteMap = ({ locations }) => {
  useEffect(() => {
    const loadMap = () => {
      const container = document.getElementById("kakao-map");
      const options = {
        center: new window.kakao.maps.LatLng(36.2683, 127.6358),
        level: 7,
      };

      const map = new window.kakao.maps.Map(container, options);
      const geocoder = new window.kakao.maps.services.Geocoder();
      const points = [];

      const geocodeAddress = (address, idx, callback) => {
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            points[idx] = coords;

            new window.kakao.maps.Marker({
              map,
              position: coords,
              title: address,
            });

            callback();
          }
        });
      };

      let completed = 0;
      locations.forEach((loc, idx) => {
        geocodeAddress(loc, idx, () => {
          completed++;
          if (completed === locations.length) {
            const polyline = new window.kakao.maps.Polyline({
              path: points,
              strokeWeight: 5,
              strokeColor: "#113F67",
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });
            polyline.setMap(map);
            map.setCenter(points[0]);
          }
        });
      });
    };

    if (window.kakao?.maps) {
      loadMap();
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
