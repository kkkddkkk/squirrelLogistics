// src/pages/Layout/Header.js
import styles from "../../css/Header.module.css";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem,
  Divider, useTheme, Drawer, List, ListItemButton, ListItemText, useMediaQuery
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";
import { useDarkMode } from "../../DarkModeContext";
import { format } from "date-fns";

const HEADER_MAX = 1200;        // 중앙 네비의 최대 폭(px) — 필요시 변경

export default function Header() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || null,
    role: localStorage.getItem("userRole") || null,
    token: localStorage.getItem("accessToken") || null,
  });

  const menuOpen = Boolean(anchorEl);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  useEffect(() => {
    const onStorage = () => {
      setUser({
        name: localStorage.getItem("userName") || null,
        role: localStorage.getItem("userRole") || null,
        token: localStorage.getItem("accessToken") || null,
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLoggedIn = (data) => {
    setUser({
      name: data?.name || localStorage.getItem("userName"),
      role: data?.role || localStorage.getItem("userRole"),
      token: data?.accessToken || localStorage.getItem("accessToken"),
    });
    setLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setUser({ name: null, role: null, token: null });
    closeMenu();
    setDrawerOpen(false);
    navigate("/");
  };

  const role = (user.role || "").toUpperCase();
  const isAuthed = !!user.token;

  const NAV = useMemo(() => ({
    GUEST: [
      { label: "서비스", path: "/service" },
      { label: "공지사항", path: "/notice" },
      { label: "회사소개", path: "/about" },
    ],
    COMPANY: [
      { label: "홈", path: "/" },
      { label: "배송신청", path: "/estimate" },
      { label: "이용 기록", path: `/company/history?date=${format(new Date(), "yyyy-MM-dd")}` },
      { label: "마이페이지", path: "/company" },
    ],
    DRIVER: [
      { label: "홈", path: "/" },
      { label: "요청 목록", path: "/driver/list" },
      { label: "진행 중 운송", path: "/driver/ongoing" },
      { label: "운송 기록", path: "/driver/deliveredlist" },
      { label: "마이페이지", path: "/driver/profile" },
    ],
    ADMIN: [{ label: "관리자페이지", path: "/admin/users" }],
  }), []);

  const navKey = !isAuthed ? "GUEST" : (NAV[role] ? role : "COMPANY");
  const leftNav = NAV[navKey];

  const isAdmin = location.pathname.startsWith("/admin");
  const adminItems = [
    { label: "회원관리", path: "/admin/users" },
    { label: "약관관리", path: "/admin/terms" },
    { label: "차량관리", path: "/admin/vehicles" },
    { label: "정산관리", path: "/admin/settlement/view" },
    { label: "신고확인", path: "/admin/reports" },
    { label: "공지사항관리", path: "/admin/notice/list" },
    { label: "배너관리", path: "/admin/banner" },
  ];

  const DrawerList = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Squirrel Logistics</Typography>
        <IconButton onClick={() => setDrawerOpen(false)} aria-label="닫기">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {(isAdmin ? adminItems : leftNav).map((it) => (
          <ListItemButton key={it.path} onClick={() => { setDrawerOpen(false); navigate(it.path); }}>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      {!isAuthed ? (
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Button fullWidth variant="contained" onClick={() => { setDrawerOpen(false); setLoginOpen(true); }}>
            로그인
          </Button>
          <Button fullWidth variant="outlined" onClick={() => { setDrawerOpen(false); navigate("/register"); }}>
            회원가입
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={handleLogout}>로그아웃</Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        color="default"
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          boxShadow: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 1980,
              mx: "auto",
              px: { xs: 1.5, sm: 2, md: 1 },
              // ✅ 모바일은 flex로 좌/우 배치, 데스크톱은 3열 grid
              display: { xs: "flex", md: "grid" },
              alignItems: "center",
              justifyContent: { xs: "space-between", md: "initial" },
              gridTemplateColumns: { md: "auto 1fr auto" },
              columnGap: { md: 2, lg: 3 },
            }}
          >
            {/* ✅ 왼쪽 클러스터: 햄버거 + 로고 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isMdUp && (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="메뉴"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                onClick={() => navigate("/")}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                Squirrel Logistics
              </Typography>
            </Box>

            {/* ✅ 가운데 네비게이션(데스크톱 전용) */}
            {isMdUp && (
              <Box
                className={styles.navButtons}
                sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}
              >
                {(isAdmin ? adminItems : leftNav).map((it) =>
                  isAdmin ? (
                    <Button
                      key={it.path}
                      color="inherit"
                      component={NavLink}
                      to={it.path}
                      style={({ isActive }) => ({
                        fontWeight: isActive ? 700 : 400,
                        textDecoration: isActive ? "underline" : "none",
                      })}
                    >
                      {it.label}
                    </Button>
                  ) : (
                    <Button key={it.path} color="inherit" onClick={() => navigate(it.path)}>
                      {it.label}
                    </Button>
                  )
                )}
              </Box>
            )}

            {/* ✅ 우측 유틸(모바일/데스크톱 공통, 데스크톱에서는 자동으로 오른쪽 칼럼) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {darkMode ? (
                <LightModeOutlinedIcon
                  sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
                  onClick={() => toggleDarkMode((prev) => !prev)}
                />
              ) : (
                <BedtimeOutlinedIcon
                  sx={{ color: theme.palette.primary.main, cursor: "pointer" }}
                  onClick={() => toggleDarkMode((prev) => !prev)}
                />
              )}

              {!isAuthed ? (
                isMdUp ? (
                  <>
                    <Button color="inherit" onClick={() => setLoginOpen(true)}>
                      로그인
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/register")}>
                      회원가입
                    </Button>
                  </>
                ) : null
              ) : (
                <>
                  <IconButton color="inherit" onClick={openMenu}>
                    <AccountCircleIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                    {user.name} 님
                  </Typography>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={closeMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate(user.role === "COMPANY" ? "/company" : "/driver/profile");
                      }}
                    >
                      내 정보
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 모바일 Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {DrawerList}
      </Drawer>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={handleLoggedIn}
      />
    </>
  );
}
