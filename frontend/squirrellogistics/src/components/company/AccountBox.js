// src/components/company/AccountBox.jsx

import React, { useState } from "react";
import "./AccountBox.css";

const AccountBox = ({ account }) => {
  const [masked, setMasked] = useState(true);

  if (!account) return null;

  const maskAccount = (account) => {
    const visible = account.slice(0, -5);
    return `${visible}${"•".repeat(5)}`;
  };

  return (
    <div className="account-box">
      <span className="info-label">메인 계좌</span>
      <div className="account-right">
        <span className="info-value">
          {masked ? maskAccount(account) : account}
        </span>
        <button
          className="mask-toggle"
          onClick={() => setMasked((prev) => !prev)}
        >
          {masked ? "계좌번호 보기" : "숨기기"}
        </button>
      </div>
    </div>
  );
};

export default AccountBox;
