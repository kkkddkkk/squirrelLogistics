// src/pages/Layout/Header.js
import styles from "../../css/Header.module.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";

import { useEffect, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";
import { useDarkMode } from "../../DarkModeContext";
import { format } from "date-fns";

export default function Header() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || null,
    role: localStorage.getItem("userRole") || null,
    token: localStorage.getItem("accessToken") || null,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  // 다른 탭에서 로그인 상태가 바뀌어도 반영
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
    navigate("/");
  };

  const role = (user.role || "").toUpperCase();
  const isAuthed = !!user.token;

  // 역할별 네비
  const NAV = {
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
  };

  const navKey = !isAuthed ? "GUEST" : (NAV[role] ? role : "COMPANY");
  const leftNav = NAV[navKey];

  const isAdmin = location.pathname.startsWith("/admin");
  const AdminNav = () => {
    const items = [
      { label: "회원관리", path: "/admin/users" },
      { label: "약관관리", path: "/admin/terms" },      
      { label: "차량관리", path: "/admin/vehicles" },
      { label: "정산관리", path: "/admin/settlement/view" },   
      { label: "신고확인", path: "/admin/reports" },      
      { label: "공지사항관리", path: "/admin/notice/list" },  
      { label: "배너관리", path: "/admin/banner" }, 
    ];
    return (
      <>
        {items.map((it) => (
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
        ))}
      </>
    );
  };

  return (
    <>
      <AppBar
        position="static"
        color="default"
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          boxShadow: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar className={styles.headerContainer}>
          {/* 로고 */}
          <Typography
            variant="h6"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            Squirrel Logistics
          </Typography>

          {/* 좌측 네비 */}
          <div className={styles.navButtons}>
            {isAdmin ? (
              <AdminNav />
            ) : (
              leftNav.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))
            )}
          </div>

          {/* 우측 사용자 영역 */}
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
              <>
                <Button color="inherit" onClick={() => setLoginOpen(true)}>
                  로그인
                </Button>
                <Button variant="outlined" onClick={() => navigate("/register")}>
                  회원가입
                </Button>
              </>
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
        </Toolbar>
      </AppBar>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={handleLoggedIn}
      />
    </>
  );
}
