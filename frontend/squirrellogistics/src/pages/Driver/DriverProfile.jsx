import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Container,
  Rating,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as TruckIcon,
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import NavBar from "../../components/driver/NavBar";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setDriver({
      name: "김동현",
      birth: "1989.02.19",
      phone: "010-2342-2342",
      email: "driver119@naver.com",
      bankAccount: "3333-1988-67613",
      businessId: "123-222-2342",
      unavailableStart: "2025-08-10",
      unavailableEnd: "2025-08-20",
      deliveryArea: "서울, 경기, 인천",
      rating: 4.8,
    });

    // 여러 대의 차량 정보 설정
    setVehicles([
      {
        id: 1,
        registrationDate: "2023.01.15",
        vehicleNumber: "24가 2839",
        vehicleType: "윙바디 탑차",
        loadCapacity: "3~5톤",
        vehicleStatus: "운행 가능",
        insuranceStatus: "유",
        currentDistance: "35,090 km",
        lastInspection: "2024.09.03",
        nextInspection: "2025.08.03",
        icon: "🚛",
      },
      {
        id: 2,
        registrationDate: "2022.06.20",
        vehicleNumber: "12나 4567",
        vehicleType: "카고 트럭",
        loadCapacity: "1~2톤",
        vehicleStatus: "정비중",
        insuranceStatus: "유",
        currentDistance: "28,450 km",
        lastInspection: "2024.11.15",
        nextInspection: "2025.11.15",
        icon: "🚚",
      },
      {
        id: 3,
        registrationDate: "2021.12.10",
        vehicleNumber: "34다 7890",
        vehicleType: "냉장 탑차",
        loadCapacity: "5톤",
        vehicleStatus: "운행 가능",
        insuranceStatus: "유",
        currentDistance: "42,300 km",
        lastInspection: "2024.08.20",
        nextInspection: "2025.08.20",
        icon: "❄️",
      },
    ]);
  }, []);

  const nextVehicle = () => {
    setSlideDirection("next");
    setCurrentVehicleIndex((prev) =>
      prev === vehicles.length - 1 ? 0 : prev + 1
    );
  };

  const prevVehicle = () => {
    setSlideDirection("prev");
    setCurrentVehicleIndex((prev) =>
      prev === 0 ? vehicles.length - 1 : prev - 1
    );
  };

  const goToVehicle = (index) => {
    setSlideDirection(index > currentVehicleIndex ? "next" : "prev");
    setCurrentVehicleIndex(index);
  };

  if (!driver || vehicles.length === 0) return <div>Loading...</div>;

  const currentVehicle = vehicles[currentVehicleIndex];

  const handleWithdraw = () => {
    const confirmed = window.confirm(
      "정말 탈퇴하시겠습니까?\n확인을 누르면 모든 정보가 삭제됩니다."
    );
    if (confirmed) {
      // TODO: 삭제 처리 로직 구현 필요 (예: API 요청 등)
      alert("회원 정보가 삭제되었습니다.");
      navigate("/goodbye");
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #113F67 0%, #58A0C8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        ></Typography>

        {/* 프로필 헤더 */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 5,
            background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
            border: "0.3px solid",
            borderColor: "primary.light",
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #3f51b5 100%)",
                  boxShadow: 4,
                }}
              >
                <PersonIcon sx={{ fontSize: 50, color: "white" }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                  gutterBottom
                >
                  {driver.name} 기사님
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  오늘도 안전운전하세요!
                </Typography>
              </Box>
            </Box>
            <Box textAlign="right">
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <StarIcon sx={{ color: "#ffc107", fontSize: 28 }} />
                <Typography variant="h4" fontWeight="bold">
                  {driver.rating}
                </Typography>
              </Box>
              <Button
                onClick={() => navigate("/driver/reviews")}
                sx={{
                  color: "#1976d2",
                  "&:hover": { color: "#1565c0" },
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                나의 리뷰 보기 ▶
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 개인 정보 섹션 */}
        <Paper
          elevation={10}
          sx={{ p: 4, mb: 5, position: "relative", borderRadius: 3 }}
        >
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate("/driver/editprofile")}
            sx={{
              position: "absolute",
              right: 32,
              top: 32,
              color: "#1976d2",
              "&:hover": { color: "#1565c0" },
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            수정하기
          </Button>

          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#e3f2fd" }}>
              <PersonIcon sx={{ fontSize: 20, color: "#1976d2" }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              운전자 개인 정보
            </Typography>
          </Box>

          <Grid container spacing={10}>
            {/* 기본 정보 */}
            <Grid item xs={12} lg={10}>
              <Card
                variant="outlined"
                sx={{
                  bgcolor: "#fafafa",
                  border: "2px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Typography variant="h5">📝</Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      기본 정보
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        이름:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right" }}
                      >
                        {driver.name}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        생년월일:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right" }}
                      >
                        {driver.birth}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        연락처:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right" }}
                      >
                        {driver.phone}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px", mt: 0.5 }}
                      >
                        이메일:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          flex: 1,
                          textAlign: "right",
                          wordBreak: "break-all",
                          lineHeight: 1.4,
                        }}
                      >
                        {driver.email}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* 사업 정보 */}
            <Grid item xs={12} lg={10}>
              <Card
                variant="outlined"
                sx={{
                  bgcolor: "#fafafa",
                  border: "2px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Typography variant="h5">💼</Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      사업 정보
                    </Typography>
                  </Box>
                  <Stack spacing={3}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        계좌번호:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right" }}
                      >
                        {driver.bankAccount}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px" }}
                      >
                        사업자번호:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right" }}
                      >
                        {driver.businessId}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px", mt: 0.5 }}
                      >
                        운행불가:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right", lineHeight: 1.4 }}
                      >
                        {driver.unavailableStart} ~ {driver.unavailableEnd}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="medium"
                        sx={{ minWidth: "80px", mt: 0.5 }}
                      >
                        배송지역:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ flex: 1, textAlign: "right", lineHeight: 1.4 }}
                      >
                        {driver.deliveryArea}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* 차량 정보 섹션 */}
        <Paper
          elevation={3}
          sx={{ p: 4, mb: 5, position: "relative", borderRadius: 3 }}
        >
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate("/driver/editvehicles")}
            sx={{
              position: "absolute",
              right: 32,
              top: 32,
              color: "#1976d2",
              "&:hover": { color: "#1565c0" },
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            차량 관리
          </Button>

          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#e8f5e8" }}>
              <TruckIcon sx={{ fontSize: 20, color: "#2e7d32" }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              등록 차량 정보
            </Typography>
            <Chip
              label={`${vehicles.length}대`}
              size="medium"
              sx={{
                ml: 2,
                bgcolor: "#f5f5f5",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            />
          </Box>

          {/* 차량 슬라이더 */}
          <Box position="relative" sx={{ mb: 4 }}>
            <IconButton
              onClick={prevVehicle}
              sx={{
                position: "absolute",
                left: -30,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "white",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "#f5f5f5",
                  transform: "translateY(-50%) scale(1.1)",
                },
                zIndex: 10,
                width: 56,
                height: 56,
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 28 }} />
            </IconButton>

            <Box sx={{ overflow: "hidden" }}>
              <Box
                sx={{
                  display: "flex",
                  transition: "transform 0.5s ease-in-out",
                  transform: `translateX(-${currentVehicleIndex * 100}%)`,
                }}
              >
                {vehicles.map((vehicle, index) => (
                  <Box
                    key={vehicle.id}
                    sx={{ minWidth: "100%", flexShrink: 0 }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        background:
                          "linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)",
                        border: "2px solid",
                        borderColor: "#c8e6c9",
                        borderRadius: 3,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={3} mb={4}>
                        <Typography variant="h1">{vehicle.icon}</Typography>
                        <Box flex={1}>
                          <Typography variant="h4" fontWeight="bold">
                            {vehicle.vehicleType}
                          </Typography>
                          <Typography variant="h5" color="text.secondary">
                            {vehicle.vehicleNumber}
                          </Typography>
                        </Box>
                        <Chip
                          label={vehicle.vehicleStatus}
                          color={
                            vehicle.vehicleStatus === "운행 가능"
                              ? "success"
                              : "warning"
                          }
                          size="large"
                          sx={{ fontSize: "1rem", fontWeight: "bold" }}
                        />
                      </Box>

                      <Grid container spacing={6}>
                        <Grid item xs={12} lg={6}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography
                                variant="h5"
                                color="text.secondary"
                                fontWeight="bold"
                                sx={{
                                  mb: 3,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                📊 차량 정보
                              </Typography>
                              <Stack spacing={3}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    sx={{ minWidth: "100px" }}
                                  >
                                    주행거리:
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ flex: 1, textAlign: "right" }}
                                  >
                                    {vehicle.currentDistance}
                                  </Typography>
                                </Box>
                                <Divider />
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    sx={{ minWidth: "100px" }}
                                  >
                                    적재용량:
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ flex: 1, textAlign: "right" }}
                                  >
                                    {vehicle.loadCapacity}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography
                                variant="h5"
                                color="text.secondary"
                                fontWeight="bold"
                                sx={{
                                  mb: 3,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                🔧 정비 정보
                              </Typography>
                              <Stack spacing={3}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    sx={{ minWidth: "100px" }}
                                  >
                                    마지막 정비:
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ flex: 1, textAlign: "right" }}
                                  >
                                    {vehicle.lastInspection}
                                  </Typography>
                                </Box>
                                <Divider />
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    sx={{ minWidth: "100px" }}
                                  >
                                    다음 정비:
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ flex: 1, textAlign: "right" }}
                                  >
                                    {vehicle.nextInspection}
                                  </Typography>
                                </Box>
                                <Divider />
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    fontWeight="medium"
                                    sx={{ minWidth: "100px" }}
                                  >
                                    보험:
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ flex: 1, textAlign: "right" }}
                                  >
                                    {vehicle.insuranceStatus}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Box>

            <IconButton
              onClick={nextVehicle}
              sx={{
                position: "absolute",
                right: -30,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "white",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "#f5f5f5",
                  transform: "translateY(-50%) scale(1.1)",
                },
                zIndex: 10,
                width: 56,
                height: 56,
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          {/* 차량 인디케이터 */}
          <Box display="flex" justifyContent="center" gap={2}>
            {vehicles.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToVehicle(index)}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor:
                    index === currentVehicleIndex ? "#1976d2" : "#e0e0e0",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    bgcolor:
                      index === currentVehicleIndex ? "#1565c0" : "#bdbdbd",
                  },
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* 탈퇴 버튼 */}
        <Box display="flex" justifyContent="center">
          <Button
            variant="outlined"
            color="error"
            onClick={handleWithdraw}
            sx={{
              mt: 3,
              px: 4,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderWidth: 2,
            }}
          >
            회원 탈퇴
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default DriverProfile;
