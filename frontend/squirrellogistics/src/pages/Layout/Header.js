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
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || null,
    role: localStorage.getItem("userRole") || null,
    token: localStorage.getItem("accessToken") || null,
  });

  // 사용자 메뉴
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  // 다른 탭에서도 로그인/로그아웃 동기화
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
    navigate("/"); // 홈으로
  };

  // 역할별 버튼 정의
  const role = (user.role || "").toUpperCase(); // "ADMIN" | "DRIVER" | "COMPANY" 등
  const roleButtons = (() => {
    if (!user.token) return null;
    switch (role) {
      case "ADMIN":
        return (
          <Button color="inherit" onClick={() => navigate("/admin")}>
            관리자
          </Button>
        );
      case "DRIVER":
        return (
          <Button color="inherit" onClick={() => navigate("/driver/profile")}>
            운전기사
          </Button>
        );
      case "COMPANY":
      case "LOGISTICS":
      case "CLIENT":
        return (
          <Button
            color="inherit"
            onClick={() => navigate("/company/dashboard")}
          >
            물류회사
          </Button>
        );
      default:
        return null;
    }
  })();

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar className={styles.headerContainer}>
          {/* 로고/홈 */}
          <Typography
            variant="h6"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            Squirrel Logistics
          </Typography>

          {/* 좌측 네비 (필요시 라우팅 연결) */}
          <div className={styles.navButtons}>
            <Button color="inherit" onClick={() => navigate("/service")}>
              서비스
            </Button>
            <Button color="inherit" onClick={() => navigate("/notice")}>
              공지사항
            </Button>
            <Button color="inherit" onClick={() => navigate("/about")}>
              회사소개
            </Button>
            {/* Role 전용 버튼 */}
            {roleButtons}
          </div>

          {/* 우측: 로그인 상태 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!user.token ? (
              <>
                <Button color="inherit" onClick={() => setLoginOpen(true)}>
                  로그인
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                >
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
                  {/* 역할별 바로가기 */}
                  {role === "ADMIN" && (
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/admin");
                      }}
                    >
                      관리자 대시보드
                    </MenuItem>
                  )}
                  {role === "DRIVER" && (
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/driver/dashboard");
                      }}
                    >
                      운전기사 대시보드
                    </MenuItem>
                  )}
                  {(role === "COMPANY" ||
                    role === "LOGISTICS" ||
                    role === "CLIENT") && (
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/company/dashboard");
                      }}
                    >
                      물류회사 대시보드
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      navigate("/mypage");
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

      {/* 로그인 모달: 로그인 성공시 상태 반영 */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoggedIn={handleLoggedIn}
      />
    </>
  );
}
