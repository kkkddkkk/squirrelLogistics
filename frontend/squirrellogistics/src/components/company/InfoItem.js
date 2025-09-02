// src/components/company/InfoItem.jsx

import React from "react";
import "./InfoItem.css";

const InfoItem = ({ label, value, color }) => {
  return (
    <div className="info-item">
      <span className="info-label"  style={{color: color}}>{label}</span>
      <span className="info-value"  style={{color: color}}>{value || "-"}</span>
    </div>
  );
};

export default InfoItem;
