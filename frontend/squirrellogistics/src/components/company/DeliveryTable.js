// src/components/company/DeliveryTable.jsx

import React from "react";
import "./DeliveryTable.css";

const DeliveryTable = ({ deliveries }) => {
  return (
    <table className="delivery-table">
      <thead>
        <tr>
          <th>상품 제목</th>
          <th>운송장 번호</th>
          <th>기사명</th>
          <th>배송 상태</th>
          <th>결제 방법</th>
          <th>금액</th>
        </tr>
      </thead>
      <tbody>
        {(!deliveries || deliveries.length === 0) ? (
          <tr>
            <td colSpan={6} style={{ textAlign: "center", padding: "1rem", color: "#777" }}>
              배송 정보가 없습니다.
            </td>
          </tr>
        ) : (
          deliveries.map((item, idx) => (
            <tr key={idx}>
              <td>{item.title}</td>
              <td>{item.trackingNumber}</td>
              <td>{item.driverName}</td>
              <td>{item.status}</td>
              <td>{item.paymentMethod}</td>
              <td>{item.price?.toLocaleString()}원</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DeliveryTable;
