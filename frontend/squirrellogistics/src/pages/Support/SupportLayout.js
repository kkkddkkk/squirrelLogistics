import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab } from "@mui/material";

const SupportLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 경로에서 탭 상태 파악
  const getTabValue = () => {
    if (location.pathname.includes("/support/notices")) return "notices";
    if (location.pathname.includes("/support/faq")) return "faq";
    if (location.pathname.includes("/support/inquiry")) return "inquiry";
    if (location.pathname.includes("/support/policy")) return "policy";
    return false;
  };

  const handleTabChange = (_, newValue) => {
    navigate(`/support/${newValue}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={getTabValue()}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="공지사항" value="notices" />
          <Tab label="FAQ" value="faq" />
          <Tab label="1:1 문의" value="inquiry" />
          <Tab label="정책" value="policy" />
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
};

export default SupportLayout;
