import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer, List, ListItemText, ListItemButton, Collapse, Box
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CampaignIcon from "@mui/icons-material/Campaign";

const MENU = [
  { label: "대시보드", path: "/admin/dashboard" },
  {
    label: "관리",
    children: [
      { label: "사용자 관리", path: "/admin/management/users" },
      { label: "차량 관리", path: "/admin/management/vehicles" },
      { label: "배송 관리", path: "/admin/management/deliveries" },
      { label: "정산 관리", path: "/admin/management/settlement" },
      { label: "배너 관리",path: "/admin/management/banners",icon: <CampaignIcon />,},

    ],
  },
  {
    label: "고객지원",
    children: [
      { label: "공지사항", path: "/admin/support/notices" },
      { label: "FAQ", path: "/admin/support/faq" },
      { label: "1:1 문의", path: "/admin/support/inquiry" },
      { label: "정책", path: "/admin/support/policy" },
      
    ],
  },
  
];

const PALETTE = {
  primary: "#113F67",
  accent: "#E8A93F",
  bg: "#F5F7FA",
  border: "#E6E8EC",
};

export default function AdminSidebar({
  appBarHeight = 64,
  drawerWidth = 240,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (base) =>
    pathname === base || pathname.startsWith(base + "/");

  // 섹션(관리/고객지원) 자동 펼침 초기값
  const initialOpen = useMemo(() => {
    const s = {};
    MENU.forEach((m) => {
      if (m.children) s[m.label] = m.children.some((c) => isActive(c.path));
    });
    return s;
  }, [pathname]);

  const [openGroup, setOpenGroup] = useState(initialOpen);
  useEffect(() => setOpenGroup((p) => ({ ...p, ...initialOpen })), [initialOpen]);

  const toggle = (label) =>
    setOpenGroup((p) => ({ ...p, [label]: !p[label] }));

  // 선택된 항목 스타일
  const selectedItemSx = {
    "&.Mui-selected": {
      bgcolor: "rgba(17,63,103,0.08)",
      borderLeft: `3px solid ${PALETTE.accent}`,
      "& .MuiListItemText-primary": { fontWeight: 800, color: PALETTE.primary },
    },
    "&.Mui-selected:hover": { bgcolor: "rgba(17,63,103,0.12)" },
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          position: "fixed",
          top: appBarHeight,                           // 탑바 아래부터
          height: `calc(100% - ${appBarHeight}px)`,
          borderRight: `1px solid ${PALETTE.border}`,
          bgcolor: PALETTE.bg,
        },
      }}
    >
      <List disablePadding sx={{ pt: 1 }}>
        {/* 단일 항목: 대시보드 */}
        <ListItemButton
          onClick={() => navigate("/admin/dashboard")}
          selected={isActive("/admin/dashboard")}
          sx={{
            ...selectedItemSx,
            py: 1.25,
            "& .MuiListItemText-primary": {
              fontSize: 14,
              fontWeight: isActive("/admin/dashboard") ? 800 : 600,
            },
          }}
        >
          <ListItemText primary="대시보드" />
        </ListItemButton>

        {/* 섹션: 관리 / 고객지원 */}
        {MENU.filter((m) => m.children).map((section) => {
          const anyChildActive = section.children.some((c) => isActive(c.path));
          const isOpen = openGroup[section.label] ?? false;
          return (
            <Box key={section.label}>
              <ListItemButton
                onClick={() => toggle(section.label)}
                sx={{
                  py: 1.1,
                  "& .MuiListItemText-primary": {
                    fontSize: 13,
                    fontWeight: anyChildActive ? 800 : 700,
                    color: anyChildActive ? PALETTE.primary : "#2A2A2A",
                  },
                }}
              >
                <ListItemText primary={section.label} />
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {section.children.map((sub) => {
                    const active = isActive(sub.path);
                    return (
                      <ListItemButton
                        key={sub.path}
                        onClick={() => navigate(sub.path)}
                        selected={active}
                        sx={{
                          ...selectedItemSx,
                          pl: 4,
                          py: 1.05,
                          "& .MuiListItemText-primary": {
                            fontSize: 13,
                            fontWeight: active ? 800 : 500,
                          },
                        }}
                      >
                        <ListItemText primary={sub.label} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}
