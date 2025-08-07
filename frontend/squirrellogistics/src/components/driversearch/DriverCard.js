// src/components/driversearch/DriverCard.js
import React from "react";
import "./DriverCard.css";

const DriverCard = ({ driver, onRequest }) => {
  const handleClick = () => {
    const confirmed = window.confirm("요청을 하시겠습니까?");
    if (confirmed) {
      onRequest(driver.id);
    }
  };

  return (
    <div className="driver-card">
      <div className="driver-img-placeholder">img</div>
      <div className="driver-info">
        <div className="driver-name-rating">
          <strong>{driver.name}</strong>
          <span className="driver-rating">⭐ {driver.rating}</span>
        </div>
        <div className="driver-detail">최대 적재량: {driver.maxWeight}</div>
        <div className="driver-detail">차량 종류: {driver.vehicleType}</div>
        <div className="driver-detail">배송 가능 지역: {driver.availableRegions?.join(", ")}</div>
        <div className="driver-detail">보험: {driver.insurance ? "가입" : "미가입"}</div>
      </div>
      <button className="request-button" onClick={handleClick}>요청</button>
    </div>
  );
};

export default DriverCard;
