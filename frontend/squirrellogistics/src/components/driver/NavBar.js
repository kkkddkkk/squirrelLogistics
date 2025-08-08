import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Stack, Container } from "@mui/material";

export default function NavBar() {
  const navigate = useNavigate();

  // 실제 사용자의 ID를 동적으로 가져와야 합니다.
  // 예시를 위해 임의의 ID를 사용했습니다.
  const driverId = 1;
  const requestId = 1;

  const menuItems = [
    { path: `/driver/detail/${requestId}`, label: "요청상세" },
    { path: `/driver/ongoing/${driverId}`, label: "진행중운송" },
    { path: `/driver/deliveredlist`, label: "운송목록" },
    { path: "/driver/registervehicle", label: "차량등록" },
    // { path: "/driver/calendar", label: "캘린더" },
    { path: "/driver/profile", label: "나의정보" },
    // { path: "/driver/support", label: "고객지원" },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#F5F7FA",
        color: "#2A2A2A",
        borderBottom: "1px solid #E0E6ED",
      }}
    >
      <Toolbar sx={{ justifyContent: "center", minHeight: 64 }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={5} justifyContent="center">
            {menuItems.map((item, index) => (
              <Typography
                key={index}
                onClick={() => handleClick(item.path)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "1rem",
                  textTransform: "none",
                  position: "relative",
                  "&:hover": {
                    color: "#113F67",
                    fontWeight: 600,
                    "&::after": {
                      content: "''",
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -6,
                      height: "2px",
                      backgroundColor: "#113F67",
                    },
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
