// src/components/driversearch/DriverCard.js
import React from "react";
import "./DriverCard.css";

const DriverCard = ({ driver, onRequest }) => {
  const handleClick = () => {
    const confirmed = window.confirm("요청을 하시겠습니까?");
    if (confirmed) {
      onRequest(driver.driverId);
    }
  };

  // 프로필 이미지 표시
  const renderProfileImage = () => {
    if (driver.profileImageUrl) {
      return <img src={driver.profileImageUrl} alt="프로필" className="driver-profile-img" />;
    }
    return <div className="driver-img-placeholder">👤</div>;
  };

  // 평점 표시 (소수점 1자리까지)
  const renderRating = () => {
    if (driver.averageRating && driver.averageRating > 0) {
      return `⭐ ${driver.averageRating.toFixed(1)}`;
    }
    return "⭐ 0.0";
  };

  // 최대 적재량 표시 (kg → 톤 변환)
  const renderMaxWeight = () => {
    if (driver.maxWeight) {
      const tons = Math.round(driver.maxWeight / 1000);
      return `${tons}톤`;
    }
    return "정보 없음";
  };

  // 즉시 배차 가능 여부 표시
  const renderDrivableStatus = () => {
    if (driver.drivable) {
      return <span className="drivable-badge">즉시 배차 가능</span>;
    }
    return <span className="drivable-badge unavailable">즉시 배차 불가</span>;
  };

  return (
    <div className="driver-card">
      {renderProfileImage()}
      <div className="driver-info">
        <div className="driver-name-rating">
          <strong>기사 #{driver.driverId}</strong>
          <span className="driver-rating">{renderRating()}</span>
        </div>
        <div className="driver-detail">
          <strong>차량 종류:</strong> {driver.vehicleTypeName || "정보 없음"}
        </div>
        <div className="driver-detail">
          <strong>최대 적재량:</strong> {renderMaxWeight()}
        </div>
        <div className="driver-detail">
          <strong>선호 지역:</strong> {driver.mainLoca || "정보 없음"}
        </div>
        <div className="driver-detail">
          <strong>보험:</strong> {driver.insurance ? "가입" : "미가입"}
        </div>
        {renderDrivableStatus()}
      </div>
      <button className="request-button" onClick={handleClick}>요청</button>
    </div>
  );
};

export default DriverCard;
