// 화면 상에서 EstimateForm 컴포넌트를 보여주는 역할

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstimateForm_prev from '../../components/estimate/EstimateForm_prev';

const EstimatePage = () => {
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
    <div className="page-wrap">
      <EstimateForm_prev />
    </div>
  );
};

export default EstimatePage;
