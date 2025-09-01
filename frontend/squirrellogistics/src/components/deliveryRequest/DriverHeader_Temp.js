import { AppBar, Box, Button, Toolbar } from "@mui/material";
import logo from "../../pages/Driver/images/logo.jpg";
import { useNavigate, useParams, useLocation } from "react-router-dom";
const DriverHeader_Temp = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const year = 2025;
  const month = 8;

  const menuItems = [
    { path: `/driver/${driverId}/list`, label: "요청 목록" },
    { path: `/driver/${driverId}/ongoing`, label: "진행 중 운송" },
    { path: `/driver/${driverId}/calendar/${year}/${month}`, label: "캘린더" },
    { path: `/driver/deliveredlist`, label: "운송 목록" },
    { path: `/driver/${driverId}/review`, label: "리뷰 관리" },
    { path: "/driver/profile", label: "나의 정보" },
  ];

  // 현재 활성 메뉴 체크
  const isActivePage = (path) => {
    if (path === "/driver/profile") {
      return location.pathname === "/driver/profile";
    }
    if (path === "/driver/deliveredlist") {
      return location.pathname === "/driver/deliveredlist";
    }
    return location.pathname.startsWith(path);
  };

  const handleClick = (path) => {
    navigate(path);
  };
  return (
    <Box>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
          {/* 로고 영역 */}
          <Box
            component="img"
            src={logo}
            alt="logo"
            sx={{
              height: 40,
              cursor: "pointer",
              transition: "opacity 0.2s ease",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate("/driver/profile")}
          />

          {/* 메뉴 영역 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {menuItems.map((item, index) => {
              const isActive = isActivePage(item.path);
              return (
                <Button
                  key={index}
                  onClick={() => handleClick(item.path)}
                  sx={{
                    color: isActive ? "#113f67" : "#666",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                    fontWeight: isActive ? "600" : "500",
                    px: 2,
                    py: 1.5,
                    minWidth: "auto",
                    borderRadius: 0,
                    textTransform: "none",
                    position: "relative",
                    transition: "color 0.2s ease",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: isActive ? "100%" : "0%",
                      height: 2,
                      bgcolor: "#113f67",
                      transition: "width 0.3s ease",
                    },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "#113f67",
                      "&::after": {
                        width: "100%",
                      },
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
export default DriverHeader_Temp;
