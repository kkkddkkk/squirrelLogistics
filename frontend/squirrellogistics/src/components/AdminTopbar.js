import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

const AdminTopbar = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#113F67" }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Squirrel Logistics 관리자
        </Typography>
        <Box flexGrow={1} />
        {/* 사용자 메뉴 or 알림 추가 가능 */}
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopbar;
