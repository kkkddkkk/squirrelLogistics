// src/pages/driversearch/DriverSearchPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DriverSearchForm from "../../components/driversearch/DriverSearchForm";

const DriverSearchPage = () => {
  const navigate = useNavigate();

  // 로그인 인증 체크
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");
    
    if (!accessToken) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/");
      return;
    }
    
    // COMPANY 또는 LOGISTICS 역할만 접근 가능
    if (userRole !== "COMPANY" && userRole !== "LOGISTICS") {
      alert("물류회사 계정으로만 접근 가능합니다.");
      navigate("/");
      return;
    }
  }, [navigate]);

  return (
    <div className="driversearch-page">
      <DriverSearchForm />
    </div>
  );
};

export default DriverSearchPage;
