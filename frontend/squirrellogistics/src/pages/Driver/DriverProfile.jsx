import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import SNSReAuthModal from "../../components/driver/SNSReAuthModal.jsx";
import {
  getDriverProfile,
  deleteAccount,
  verifyPassword,
} from "../../api/driver/driverApi";
import { fetchCars } from "../../api/cars";

const DriverProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [driver, setDriver] = useState({
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
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSNSReAuthModal, setShowSNSReAuthModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginType, setLoginType] = useState("EMAIL"); // EMAIL: 일반 로그인, GOOGLE: 구글 로그인, KAKAO: 카카오 로그인
  const [hasSetPassword, setHasSetPassword] = useState(false); // SNS 로그인 사용자의 비밀번호 설정 여부
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // EditProfile에서 전달받은 state 처리
  useEffect(() => {
    if (
      location.state?.fromEditProfile &&
      location.state?.updatedProfileImage
    ) {
      console.log(
        "EditProfile에서 전달받은 프로필 이미지:",
        location.state.updatedProfileImage.substring(0, 50) + "..."
      );
      console.log("타임스탬프:", location.state.timestamp);

      // 즉시 이미지 URL 설정
      setProfileImageUrl(location.state.updatedProfileImage);
      localStorage.setItem(
        "profileImageUrl",
        location.state.updatedProfileImage
      );

      // state 초기화 (중복 처리 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // accessToken을 사용해서 프로필 조회
        const accessToken = localStorage.getItem("accessToken");
        const userRole = localStorage.getItem("userRole");
        const userName = localStorage.getItem("userName");

        console.log("디버깅 정보:", {
          accessToken: accessToken ? "있음" : "없음",
          userRole: userRole,
          userName: userName,
        });

        if (!accessToken) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
          setLoading(false);
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }

        if (userRole !== "DRIVER" && userRole !== "ETC") {
          setError("기사 계정으로 로그인해주세요.");
          setLoading(false);
          setTimeout(() => {
            navigate("/");
          }, 2000);
          return;
        }

        // accessToken을 사용해서 기사 프로필 조회 (백엔드에서 JWT 토큰에서 userId 추출)
        const driverData = await getDriverProfile();

        console.log("가져온 기사 프로필 데이터:", driverData);
        console.log("userDTO 데이터:", driverData.userDTO);

        // API 응답 데이터를 컴포넌트 상태에 맞게 변환
        setDriver({
          name: driverData.userDTO?.name || "",
          birth: driverData.userDTO?.birthday || "",
          phone: driverData.userDTO?.pnumber || "",
          email: driverData.userDTO?.email || "",
          bankAccount: driverData.userDTO?.account || "",
          businessId: driverData.userDTO?.businessN || "",
          unavailableStart: "", // API에 없는 필드
          unavailableEnd: "", // API에 없는 필드
          deliveryArea: driverData.mainLoca || "",
          rating: 0, // API에 없는 필드
        });

        console.log("설정된 driver 상태:", {
          name: driverData.userDTO?.name || "",
          phone: driverData.userDTO?.pnumber || "",
          email: driverData.userDTO?.email || "",
        });

        // 프로필 이미지 설정
        if (driverData.profileImageUrl) {
          console.log(
            "백엔드에서 받은 프로필 이미지 URL:",
            driverData.profileImageUrl
          );
          // 백엔드 URL이 data URL인 경우에만 사용
          if (driverData.profileImageUrl.startsWith("data:image")) {
            setProfileImageUrl(driverData.profileImageUrl);
            localStorage.setItem("profileImageUrl", driverData.profileImageUrl);
          } else {
            // 백엔드 URL이 data URL이 아닌 경우 localStorage에서 data URL 확인
            const savedDataUrl = localStorage.getItem("profileImageUrl");
            if (savedDataUrl && savedDataUrl.startsWith("data:image")) {
              console.log(
                "localStorage에서 data URL 사용:",
                savedDataUrl.substring(0, 50) + "..."
              );
              setProfileImageUrl(savedDataUrl);
            } else {
              setProfileImageUrl(driverData.profileImageUrl);
              localStorage.setItem(
                "profileImageUrl",
                driverData.profileImageUrl
              );
            }
          }
        } else {
          // 저장된 프로필 이미지 로드
          const savedImageUrl = localStorage.getItem("profileImageUrl");
          if (savedImageUrl) {
            console.log(
              "localStorage에서 로드한 프로필 이미지 URL:",
              savedImageUrl.substring(0, 50) + "..."
            );
            setProfileImageUrl(savedImageUrl);
          } else {
            // 프로필 이미지가 없으면 빈 문자열로 설정 (기본 Person 아이콘 표시)
            console.log("프로필 이미지 없음, 기본 아이콘 표시");
            setProfileImageUrl("");
          }
        }

        // SNS 로그인 여부 확인 (loginId 패턴으로 판단)
        // google_로 시작하면 SNS 로그인, 아니면 일반 로그인
        const loginId = driverData.userDTO?.loginId || "";
        const isSnsLogin =
          loginId.startsWith("google_") || loginId.startsWith("kakao_");

        if (isSnsLogin) {
          setLoginType("GOOGLE"); // SNS 로그인 사용자
          setHasSetPassword(false); // SNS 로그인 사용자는 비밀번호 설정 여부 확인 필요
        } else {
          setLoginType("EMAIL"); // 일반 로그인 사용자
          setHasSetPassword(true); // 일반 로그인 사용자는 비밀번호가 있음
        }

        // 실제 차량 데이터 가져오기
        await fetchVehicles();
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

  // 차량 정보만 가져오는 함수
  const fetchVehicles = async () => {
    try {
      const carsData = await fetchCars();
      console.log("가져온 차량 데이터:", carsData);

      const formattedVehicles = carsData.map((car, index) => {
        console.log("개별 차량 데이터:", car);

        return {
          id: car.carId,
          registrationDate: car.regDate
            ? new Date(car.regDate).toLocaleDateString("ko-KR")
            : "등록일 없음",
          vehicleNumber: car.carNum || "차량번호 없음",
          vehicleType: car.vehicleType?.name || "차종 정보 없음",
          loadCapacity: car.vehicleType?.maxWeight
            ? `${car.vehicleType.maxWeight}kg`
            : "적재량 정보 없음",
          vehicleStatus: car.carStatus || "운행 가능",
          insuranceStatus: car.insurance ? "유" : "무",
          currentDistance: car.Mileage
            ? `${car.Mileage.toLocaleString()} km`
            : "0 km",
          lastInspection: car.inspection
            ? new Date(car.inspection).toLocaleDateString("ko-KR")
            : "점검일 정보 없음",
          nextInspection: car.inspection
            ? new Date(car.inspection).toLocaleDateString("ko-KR")
            : "점검일 정보 없음",
          icon: "🚛", // 기본 아이콘
        };
      });

      console.log("변환된 차량 데이터:", formattedVehicles);

      setVehicles(formattedVehicles);
    } catch (carError) {
      console.error("차량 정보 조회 실패:", carError);
      // 차량 정보 조회 실패 시 빈 배열로 설정
      setVehicles([]);
    }
  };

  // 페이지 포커스 시 차량 정보 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log("페이지 포커스됨 - 차량 정보 새로고침");
      fetchVehicles();
    };

    // 페이지가 보일 때마다 차량 정보 새로고침
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("페이지가 보임 - 차량 정보 새로고침");
        fetchVehicles();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 주기적으로 차량 정보 새로고침 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("주기적 차량 정보 새로고침");
      fetchVehicles();
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, []);

  // 차량 관리 페이지에서 돌아올 때 차량 정보 새로고침
  useEffect(() => {
    // 차량 관리 페이지에서 돌아왔는지 확인
    if (
      location.pathname === "/driver/profile" &&
      location.state?.fromVehicleManagement
    ) {
      console.log("차량 관리 페이지에서 돌아옴 - 차량 정보 새로고침");
      fetchVehicles();
    }
  }, [location]);

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
        await deleteAccount();

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

  // 수정하기 버튼 클릭 처리
  const handleEditClick = () => {
    if (loginType === "EMAIL") {
      // 일반 로그인 사용자: VerificationPage로 이동 (비밀번호 확인)
      navigate("/driver/verification");
    } else if (loginType === "GOOGLE" || loginType === "KAKAO") {
      // SNS 로그인 사용자: SNS 재인증 모달 표시
      setShowSNSReAuthModal(true);
    }
  };

  // SNS 재인증 성공 시 처리
  const handleSNSReAuthSuccess = () => {
    setShowSNSReAuthModal(false);
    navigate("/driver/editprofile");
  };

  // SNS 재인증 모달 닫기
  const handleSNSReAuthClose = () => {
    setShowSNSReAuthModal(false);
  };

  // 비밀번호 확인 모달 닫기
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword("");
    setPasswordError("");
  };

  // 비밀번호 확인 처리
  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await verifyPassword(password);
      setShowPasswordModal(false);
      setPassword("");
      setPasswordError("");
      navigate("/driver/editprofile");
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      setPasswordError("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
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
                  alt="프로필 이미지"
                  size={150}
                  editable={false}
                  showEditIcon={false}
                  sx={{
                    "& .MuiAvatar-root": {
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
                            onClick={() =>
                              navigate("/driver/managevehicles", {
                                state: { fromProfile: true },
                              })
                            }
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

      {/* SNS 재인증 모달 */}
      <SNSReAuthModal
        open={showSNSReAuthModal}
        onClose={handleSNSReAuthClose}
        loginType={loginType}
        onSuccess={handleSNSReAuthSuccess}
      />
    </Box>
  );
};

export default DriverProfile;
