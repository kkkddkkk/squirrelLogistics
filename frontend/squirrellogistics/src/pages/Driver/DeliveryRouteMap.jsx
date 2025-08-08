import React, { useEffect } from "react";

const DeliveryRouteMap = () => {
  useEffect(() => {
    const kakao = window.kakao;

    const container = document.getElementById("delivery-map");
    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 5,
    };

    new kakao.maps.Map(container, options);
  }, []);

  return (
    <div
      id="delivery-map"
      style={{
        width: "100%",
        height: "400px",
        border: "2px solid #113F67",
        borderRadius: 8,
      }}
    />
  );
};

export default DeliveryRouteMap;
