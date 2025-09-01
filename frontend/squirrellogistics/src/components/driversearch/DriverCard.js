// src/components/driversearch/DriverCard.js
import React from "react";
import "./DriverCard.css";
import { theme, applyThemeToCssVars } from "../common/CommonTheme";
import { OneButtonAtRight } from "../common/CommonButton";
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import { Box } from "@mui/material";

/**
 * 기사 카드 컴포넌트
 * 백엔드 DriverSearchResponseDTO의 데이터를 표시
 * 
 * @param {Object} driver - 기사 정보 (DriverSearchResponseDTO)
 * @param {Function} onRequest - 요청 버튼 클릭 시 호출되는 함수
 */
const DriverCard = ({ driver, onRequest }) => {
  // 디버깅: 받은 데이터 확인
  console.log("DriverCard received driver data:", driver);
  applyThemeToCssVars(theme);

  const handleClick = () => {
    // 중복된 confirm 제거 - DriverSearchForm에서 처리
    onRequest(driver.driverId);
  };

  // 프로필 이미지 표시
  const renderProfileImage = () => {
    if (driver.profileImageUrl) {
      return <img src={driver.profileImageUrl} alt="프로필" className="driver-profile-img" />;
    }
    return <div className="driver-img-placeholder">👤</div>;
  };

  // 평점 표시 (소수점 1자리까지, Double 타입)
  const renderRating = () => {
    if (driver.averageRating && driver.averageRating > 0) {
      return (
        <Box display={"flex"} alignItems={"center"}>
          <StarOutlinedIcon /> &nbsp; ${driver.averageRating.toFixed(1)}
        </Box>
      );
    }
    return (
      <Box display={"flex"} alignItems={"center"}>
        <StarOutlinedIcon /> &nbsp;0.0
      </Box>
    );
  };

  // 최대 적재량 표시 (kg → 톤 변환, Integer 타입)
  const renderMaxWeight = () => {
    if (driver.maxWeight) {
      const tons = Math.round(driver.maxWeight / 1000);
      return `${tons}톤`;
    }
    return "정보 없음";
  };

  // 즉시 배차 가능 여부 표시 (Boolean 타입)
  const renderDrivableStatus = () => {
    if (driver.drivable) {
      return <span className="drivable-badge">즉시 배차 가능</span>;
    }
    return <span className="drivable-badge unavailable">즉시 배차 불가</span>;
  };

  return (
    <div className="driver-card">
      <div className="driver-image">
        {renderProfileImage()}
      </div>
      <div className="driver-info">
        <div className="driver-name-rating">
          <strong>{driver.driverName || `기사 #${driver.driverId}`}</strong>
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
      <OneButtonAtRight clickEvent={handleClick}>요청</OneButtonAtRight>
    </div>
  );
};

export default DriverCard;
