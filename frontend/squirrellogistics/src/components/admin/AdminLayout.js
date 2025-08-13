// src/components/admin/AdminLayout.js
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

// 사이드바/탑바를 숨길 경로 (앞부분 일치도 숨기고 싶다면 startsWith 사용)
const hiddenPaths = [
  "/admin/login",
  "/admin/signup",
  "/admin/find-id",
  "/admin/password-reset",
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  // exact 매치만 숨기려면 includes → === 비교로 바꾸면 됨
  const hideLayout = hiddenPaths.includes(pathname);

  const OutletWithSuspense = (
    <Suspense fallback={<div />}>
      <Outlet />
    </Suspense>
  );

  // 숨길 경우 최소 출력
  if (hideLayout) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        {OutletWithSuspense}
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
          {OutletWithSuspense}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
