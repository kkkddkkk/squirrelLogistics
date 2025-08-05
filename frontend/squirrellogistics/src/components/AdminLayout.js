// src/components/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 사이드바 */}
      <AdminSidebar />

      {/* 콘텐츠 영역 */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* 상단바 */}
        <AdminTopbar />

        {/* 페이지 콘텐츠 */}
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f7fa" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
