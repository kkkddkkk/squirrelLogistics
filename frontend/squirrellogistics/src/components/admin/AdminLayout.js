import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

// 사이드바/탑바를 숨길 경로
const hiddenPaths = [
  "/admin/login",
  "/admin/signup",
  "/admin/find-id",
  "/admin/password-reset",
];

const AdminLayout = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // exact match가 아니고, 포함되기만 해도 숨기고 싶다면 includes → some 사용 가능
  const hideLayout = hiddenPaths.includes(pathname);

  // 숨길 경우 최소 출력
  if (hideLayout) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Outlet />
      </Box>
    );
  }

  // 기본 관리자 레이아웃
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AdminTopbar />
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f7fa" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
