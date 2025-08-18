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
import ProfileImage from "../../components/driver/ProfileImage";
import {
  getDriverProfile,
  deleteAccount,
  verifyPassword,
} from "../../api/driver/driverApi";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginType, setLoginType] = useState("EMAIL"); // EMAIL: 일반 로그인, GOOGLE: 구글 로그인, KAKAO: 카카오 로그인
  const [hasSetPassword, setHasSetPassword] = useState(false); // SNS 로그인 사용자의 비밀번호 설정 여부
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제로는 로그인된 사용자의 driverId를 가져와야 함
        const driverId = localStorage.getItem("driverId") || "1"; // 임시로 1 사용

        const driverData = await getDriverProfile(driverId);

        // API 응답 데이터를 컴포넌트 상태에 맞게 변환
        setDriver({
          name: driverData.userDTO?.name || "",
          birth: driverData.userDTO?.birthday || "",
          phone: driverData.userDTO?.Pnumber || "",
          email: driverData.userDTO?.email || "",
          bankAccount: driverData.userDTO?.account || "",
          businessId: driverData.userDTO?.businessN || "",
          unavailableStart: "", // API에 없는 필드
          unavailableEnd: "", // API에 없는 필드
          deliveryArea: driverData.mainLoca || "",
          rating: 0, // API에 없는 필드
        });

        // 프로필 이미지 설정
        if (driverData.profileImageUrl) {
          setProfileImageUrl(driverData.profileImageUrl);
        } else {
          // 저장된 프로필 이미지 로드
          const savedImageUrl = localStorage.getItem("profileImageUrl");
          if (savedImageUrl) {
            setProfileImageUrl(savedImageUrl);
          }
        }

        // 로그인 타입과 비밀번호 설정 여부 확인
        const savedLoginType = localStorage.getItem("loginType");
        const savedHasSetPassword = localStorage.getItem("hasSetPassword");

        if (savedLoginType) {
          setLoginType(savedLoginType);
        }

        if (savedHasSetPassword) {
          setHasSetPassword(savedHasSetPassword === "true");
        }

        // 여러 대의 차량 정보 설정 (임시 데이터)
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
      } catch (error) {
        console.error("기사 프로필 조회 실패:", error);
        setError("기사 정보를 불러오는데 실패했습니다.");

        // 에러 시 빈 데이터 설정
        setDriver({
          name: "",
          birth: "",
          phone: "",
          email: "",
          bankAccount: "",
          businessId: "",
          unavailableStart: "",
          unavailableEnd: "",
          deliveryArea: "",
          rating: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!driver) return <div>데이터를 불러올 수 없습니다.</div>;

  const currentVehicle = vehicles[currentVehicleIndex];

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      "정말 탈퇴하시겠습니까?\n확인을 누르면 모든 정보가 삭제됩니다."
    );
    if (confirmed) {
      try {
        const driverId = localStorage.getItem("driverId") || "1";
        await deleteAccount(driverId);

        // 로컬 스토리지 정리
        localStorage.clear();
        sessionStorage.clear();

        alert("회원 정보가 삭제되었습니다.");
        navigate("/goodbye");
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        alert("회원 탈퇴 중 오류가 발생했습니다.");
      }
    }
  };

  // 비밀번호 확인 모달 열기
  const handleEditClick = () => {
    if (loginType === "EMAIL") {
      // 일반 로그인 사용자: VerificationPage로 이동
      navigate("/driver/verification");
    } else if (loginType === "GOOGLE" || loginType === "KAKAO") {
      // SNS 로그인 사용자
      if (hasSetPassword) {
        // 비밀번호를 이미 설정한 경우: VerificationPage로 이동
        navigate("/driver/verification");
      } else {
        // 비밀번호를 아직 설정하지 않은 경우: 바로 EditProfile로 이동
        navigate("/driver/editprofile");
      }
    }
  };

  // 비밀번호 확인
  const handlePasswordConfirm = async () => {
    try {
      const driverId = localStorage.getItem("driverId") || "1";

      // 백엔드 API를 통해 비밀번호 확인
      const isValid = await verifyPassword(driverId, password);

      if (isValid) {
        setShowPasswordModal(false);
        setPassword("");
        setPasswordError("");
        navigate("/driver/editprofile");
      } else {
        setPasswordError("비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      setPasswordError("비밀번호 확인 중 오류가 발생했습니다.");
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
                <ProfileImage
                  imageUrl={profileImageUrl}
                  alt="기사 프로필"
                  size={150}
                  editable={false}
                  sx={{
                    "& .MuiAvatar-root": {
                      bgcolor: "white",
                      color: "#113F67",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    },
                  }}
                />
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
