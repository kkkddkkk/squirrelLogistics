import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
} from "@mui/icons-material";
import NavBar from "../../components/driver/NavBar";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginType, setLoginType] = useState(0); // 0: 일반 로그인, 1: SNS 로그인
  const [hasSetPassword, setHasSetPassword] = useState(false); // SNS 로그인 사용자의 비밀번호 설정 여부
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

    // 저장된 프로필 이미지 로드
    const savedImageUrl = localStorage.getItem("profileImageUrl");
    if (savedImageUrl) {
      setProfileImageUrl(savedImageUrl);
    }

    // 로그인 타입과 비밀번호 설정 여부 확인
    const savedLoginType = localStorage.getItem("loginType");
    const savedHasSetPassword = localStorage.getItem("hasSetPassword");

    if (savedLoginType) {
      setLoginType(parseInt(savedLoginType));
    }

    if (savedHasSetPassword) {
      setHasSetPassword(savedHasSetPassword === "true");
    }

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
        vehicleStatus: "운행불가",
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

  const handleEmergencyReport = (vehicleNumber) => {
    const confirmed = window.confirm(
      `차량번호 ${vehicleNumber} 에 대한 긴급 신고를 하시겠습니까?`
    );
    if (confirmed) {
      // TODO: 긴급 신고 처리 로직 구현 필요 (예: 문의 페이지로 이동하여 글 작성)
      // navigate('/inquiry/report', { state: { vehicleNumber } });
      alert(`긴급 신고가 접수되었습니다. 최대한 신속하게 처리하겠습니다.`);
    }
  };

  const handleHeaderEmergencyReport = () => {
    const confirmed = window.confirm(
      "긴급 신고하게 될 경우 관리자에게 메세지가 전송됩니다."
    );
    if (confirmed) {
      // TODO: 긴급 신고 처리 로직 구현 필요 (예: API 요청 등)
      alert("긴급 신고가 접수되었습니다. 관리자에게 메시지가 전송됩니다.");
    }
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

  // 비밀번호 확인 모달 열기
  const handleEditClick = () => {
    if (loginType === 0) {
      // 일반 로그인 사용자: 비밀번호 확인
      setShowPasswordModal(true);
      setPassword("");
      setPasswordError("");
    } else if (loginType === 1) {
      // SNS 로그인 사용자
      if (hasSetPassword) {
        // 비밀번호를 이미 설정한 경우: 비밀번호 확인
        setShowPasswordModal(true);
        setPassword("");
        setPasswordError("");
      } else {
        // 비밀번호를 아직 설정하지 않은 경우: 바로 EditProfile로 이동
        navigate("/driver/editprofile");
      }
    }
  };

  // 비밀번호 확인
  const handlePasswordConfirm = () => {
    if (loginType === 0) {
      // 일반 로그인 사용자: 기존 비밀번호 확인
      const correctPassword = "1234"; // 테스트용 비밀번호

      if (password === correctPassword) {
        setShowPasswordModal(false);
        setPassword("");
        setPasswordError("");
        navigate("/driver/editprofile");
      } else {
        setPasswordError("비밀번호가 일치하지 않습니다.");
      }
    } else if (loginType === 1) {
      // SNS 로그인 사용자: 비밀번호 설정 또는 확인
      if (hasSetPassword) {
        // 이미 비밀번호를 설정한 경우: 비밀번호 확인
        const savedPassword = localStorage.getItem("snsUserPassword");

        if (password === savedPassword) {
          setShowPasswordModal(false);
          setPassword("");
          setPasswordError("");
          navigate("/driver/editprofile");
        } else {
          setPasswordError("비밀번호가 일치하지 않습니다.");
        }
      } else {
        // 처음 비밀번호를 설정하는 경우
        if (password.length < 4) {
          setPasswordError("비밀번호는 4자 이상이어야 합니다.");
          return;
        }

        // 비밀번호 저장
        localStorage.setItem("snsUserPassword", password);
        localStorage.setItem("hasSetPassword", "true");
        setHasSetPassword(true);

        setShowPasswordModal(false);
        setPassword("");
        setPasswordError("");
        navigate("/driver/editprofile");
      }
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword("");
    setPasswordError("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "운행 가능":
        return "success";
      case "정비중":
        return "warning";
      case "운행불가":
        return "error";
      default:
        return "default";
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
            color: "#757575",
          }}
        ></Typography>

        {/* 운전자 개인 정보 섹션 */}
        <Paper
          elevation={0}
          sx={{
            mb: 5,
            position: "relative",
            borderRadius: 0,
            bgcolor: "transparent",
          }}
        >
          <Button
            onClick={handleEditClick}
            sx={{
              position: "absolute",
              right: 26,
              top: 15,
              color: "#113F67",
              "&:hover": { color: "#34699A" },
              fontSize: "1rem",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            수정하기
          </Button>

          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Typography variant="h4" fontWeight="bold" color="#113F67">
              운전자 개인 정보
            </Typography>
          </Box>

          {/* 2단 레이아웃 */}
          <Box display="flex" sx={{ minHeight: "800px" }}>
            {/* 왼쪽 컬럼 - 어두운 배경 */}
            <Box
              sx={{
                width: "35%",
                bgcolor: "#113F67",
                color: "white",
                p: 5,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* 프로필 사진 */}
              <Box display="flex" justifyContent="center" mb={4}>
                {profileImageUrl ? (
                  <Avatar
                    src={profileImageUrl}
                    sx={{
                      width: 150,
                      height: 150,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      bgcolor: "white",
                      color: "#113F67",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 80 }} />
                  </Avatar>
                )}
              </Box>

              {/* 이름 */}
              <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                sx={{ mb: 4 }}
              >
                {driver.name} 기사님
              </Typography>

              {/* 개인 정보 영역 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  개인 정보
                </Typography>
                <Box
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.3)",
                    mb: 3,
                  }}
                />
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      생년월일
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.birth}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      연락처
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      이메일
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* 사업 정보 영역 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  사업 정보
                </Typography>
                <Box
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.3)",
                    mb: 3,
                  }}
                />
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      계좌번호
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.bankAccount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      사업자번호
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.businessId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,0.6)"
                      sx={{ mb: 1 }}
                    >
                      배송 지역
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {driver.deliveryArea}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* 버튼들 */}
              <Box sx={{ mt: "auto" }}>
                <Stack spacing={3}>
                  <Button
                    onClick={() => navigate("/driver/reviews")}
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      borderWidth: 2,
                      py: 2,
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#113F67",
                        borderColor: "white",
                        borderWidth: 2,
                      },
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    나의 리뷰 보기
                  </Button>
                  <Button
                    onClick={handleHeaderEmergencyReport}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: "#A20025",
                      color: "white",
                      py: 2,
                      "&:hover": {
                        bgcolor: "#8B001F",
                      },
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                    startIcon={<ReportProblemOutlinedIcon />}
                  >
                    긴급 신고
                  </Button>
                </Stack>
              </Box>
            </Box>

            {/* 오른쪽 컬럼 - 흰색 배경 */}
            <Box
              sx={{
                width: "65%",
                bgcolor: "white",
                p: 5,
                border: "1px solid #E0E6ED",
              }}
            >
              {/* 차량 정보 */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#113F67"
                  sx={{ mb: 4 }}
                >
                  등록 차량 정보
                </Typography>

                {/* 차량 슬라이더 */}
                <Box position="relative" sx={{ mb: 5 }}>
                  <IconButton
                    onClick={prevVehicle}
                    sx={{
                      position: "absolute",
                      left: -40,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "white",
                      boxShadow: 4,
                      "&:hover": {
                        bgcolor: "#f5f5f5",
                        transform: "translateY(-50%) scale(1.1)",
                      },
                      zIndex: 10,
                      width: 60,
                      height: 60,
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 32 }} />
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
                          <Box
                            sx={{
                              p: 4,
                              bgcolor: "#F5F7FA",
                              borderRadius: 3,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: "#E8E8E8",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              },
                            }}
                            onClick={() => navigate("/driver/registervehicle")}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={4}
                              mb={4}
                            >
                              <Typography variant="h1">
                                {vehicle.icon}
                              </Typography>
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
                                color={getStatusColor(vehicle.vehicleStatus)}
                                size="large"
                                sx={{
                                  fontSize: "1.1rem",
                                  fontWeight: "500",
                                  py: 1,
                                }}
                              />
                            </Box>

                            <Grid container spacing={4}>
                              <Grid item xs={6}>
                                <Stack spacing={3}>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      등록일
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.registrationDate}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      주행거리
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.currentDistance}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      적재용량
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.loadCapacity}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                <Stack spacing={3}>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      마지막 정비
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.lastInspection}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      다음 정비일
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.nextInspection}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      보험
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                      {vehicle.insuranceStatus}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <IconButton
                    onClick={nextVehicle}
                    sx={{
                      position: "absolute",
                      right: -40,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "white",
                      boxShadow: 4,
                      "&:hover": {
                        bgcolor: "#f5f5f5",
                        transform: "translateY(-50%) scale(1.1)",
                      },
                      zIndex: 10,
                      width: 60,
                      height: 60,
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                </Box>

                {/* 차량 인디케이터 */}
                <Box display="flex" justifyContent="center" gap={3}>
                  {vehicles.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => goToVehicle(index)}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor:
                          index === currentVehicleIndex ? "#113F67" : "#E0E6ED",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                        "&:hover": {
                          bgcolor:
                            index === currentVehicleIndex
                              ? "#34699A"
                              : "#C5C9D0",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 일정 관리 */}
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="#113F67"
                  sx={{ mb: 4 }}
                >
                  일정 관리
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    p: 3,
                    bgcolor: "#F5F7FA",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#E8E8E8",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                  onClick={() => navigate("/driver/driverid")}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                      displayStaticWrapperAs="desktop"
                      defaultValue={dayjs("2025-08-01")}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 테스트용 로그인 타입 설정 버튼 */}
        <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.setItem("loginType", "0");
              localStorage.removeItem("hasSetPassword");
              localStorage.removeItem("snsUserPassword");
              setLoginType(0);
              setHasSetPassword(false);
              alert("일반 로그인 사용자로 설정되었습니다.");
            }}
            sx={{ px: 3, py: 1 }}
          >
            일반 로그인 (0)
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.setItem("loginType", "1");
              localStorage.removeItem("hasSetPassword");
              localStorage.removeItem("snsUserPassword");
              setLoginType(1);
              setHasSetPassword(false);
              alert("SNS 로그인 사용자로 설정되었습니다.");
            }}
            sx={{ px: 3, py: 1 }}
          >
            SNS 로그인 (1)
          </Button>
        </Box>

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

      {/* 비밀번호 확인 모달 */}
      <Dialog
        open={showPasswordModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", color: "#113F67", fontWeight: "bold" }}
        >
          {loginType === 0
            ? "비밀번호 확인"
            : hasSetPassword
            ? "비밀번호 확인"
            : "비밀번호 설정"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            {loginType === 0
              ? "회원정보 수정을 위해 비밀번호를 입력해주세요."
              : hasSetPassword
              ? "회원정보 수정을 위해 비밀번호를 입력해주세요."
              : "회원정보 수정을 위해 비밀번호를 설정해주세요. (4자 이상)"}
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mt: 2 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handlePasswordConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ mr: 2 }}>
            취소
          </Button>
          <Button
            onClick={handlePasswordConfirm}
            variant="contained"
            sx={{
              bgcolor: "#113F67",
              "&:hover": { bgcolor: "#0d2d4a" },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverProfile;
