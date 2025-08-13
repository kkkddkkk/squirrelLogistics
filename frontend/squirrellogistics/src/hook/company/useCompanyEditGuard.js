// 인증 없이 /company/edit 직접 접근 시 verify 페이지로 보냄
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useCompanyEditGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const ok = sessionStorage.getItem("company_edit_verified");
    if (!ok) navigate("/company/verify", { replace: true });
  }, [navigate]);
};

export default useCompanyEditGuard;
