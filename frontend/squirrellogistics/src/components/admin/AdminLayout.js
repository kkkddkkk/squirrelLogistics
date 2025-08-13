import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const DRAWER_WIDTH = 240;
const APPBAR_HEIGHT = 64; // AdminTopbar 높이와 맞추세요

// 사이드바만 숨길 경로 (정확 일치)
const hiddenSidebarExact = [
  "/admin",              // 로그인 루트 등
  "/admin/signup",
  "/admin/find-id",
  "/admin/password-reset",
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const hideSidebar = hiddenSidebarExact.includes(pathname);

  const OutletWithSuspense = (
    <Suspense fallback={<div />}>
      <Outlet />
    </Suspense>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* 고정 탑바 (전체 상단) */}
      <AdminTopbar />

      {/* 고정 사이드바: 숨길 때만 제거 */}
      {!hideSidebar && (
        <AdminSidebar
          appBarHeight={APPBAR_HEIGHT}
          drawerWidth={DRAWER_WIDTH}
        />
      )}

      {/* 메인 컨텐츠: 사이드바 공간 + 탑바 높이만큼 여백 확보 */}
      <Box
        sx={{
          pt: `${APPBAR_HEIGHT}px`,
          ml: hideSidebar ? 0 : `${DRAWER_WIDTH}px`,
          px: { xs: 1.5, md: 3 },
          pb: 3,
        }}
      >
        {OutletWithSuspense}
      </Box>
    </Box>
  );
};

export default AdminLayout;
