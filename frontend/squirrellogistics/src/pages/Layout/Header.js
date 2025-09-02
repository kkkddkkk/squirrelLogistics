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
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { useNavigate } from "react-router-dom";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import { theme } from "../../components/common/CommonTheme";
import { useOutletContext } from "react-router-dom";
import { useDarkMode } from "../../DarkModeContext";

export default function Header() {

  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

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

  // 로컬스토리지 변경(다른 탭 포함) 반영
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

  /**
   * 역할별 네비게이션 설정
   * - 여기서 라벨/경로를 원하는 대로 수정하세요.
   * - 경로는 /company 같은 base 없이 바로 절대경로 사용.
   */
  const NAV = {
    GUEST: [
      { label: "서비스", path: "/service" },
      { label: "공지사항", path: "/notice" },
      { label: "회사소개", path: "/about" },
    ],
    COMPANY: [
      { label: "홈", path: "/" },
      { label: "배송신청", path: "/estimate" },
      { label: "이용 기록", path: "/company/history" },
      { label: "마이페이지", path: "/company" },
    ],
    DRIVER: [
      { label: "홈", path: "/" },
      { label: "요청 목록", path: "/driver/list" },
      { label: "진행 중 운송", path: "/driver/ongoing" },
      { label: "운송 기록", path: "/driver/deliveredlist" },
      { label: "마이페이지", path: "/driver/profile" },
    ],
    ADMIN: [
      // 대시보드 없이 일반 메뉴 예시
      { label: "사용자", path: "/admin/users" },
      { label: "공지관리", path: "/admin/notices" },
      { label: "설정", path: "/admin/settings" },
    ],
  };

  // 현재 노출할 네비 결정 (로그인 X -> GUEST, 로그인 O -> 해당 ROLE, 없으면 COMPANY 기본)
  const navKey = !isAuthed
    ? "GUEST"
    : NAV[role]
      ? role
      : "COMPANY";

  const leftNav = NAV[navKey];

  const thisTheme = useTheme();
  return (
    <>
      <AppBar position="static" color={thisTheme.palette.background.default}>
        <Toolbar className={styles.headerContainer}>
          {/* 로고 */}
          <Typography
            variant="h6"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            Squirrel Logistics
          </Typography>

          {/* 좌측 네비: 역할에 따라 버튼 구성 */}
          <div className={styles.navButtons}>
            {leftNav.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* 우측 사용자 영역 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {darkMode ? (
              <LightModeOutlinedIcon
                sx={{ color: thisTheme.palette.primary.main, cursor: "pointer" }}
                onClick={() => setDarkMode(prev => !prev)}
              />
            ) : (
              <BedtimeOutlinedIcon
                sx={{ color: thisTheme.palette.primary.main, cursor: "pointer" }}
                onClick={() => setDarkMode(prev => !prev)}
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
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
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
                      {user.role === 'COMPANY' ? navigate("/company") : navigate("/driver/profile")}
                      
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
