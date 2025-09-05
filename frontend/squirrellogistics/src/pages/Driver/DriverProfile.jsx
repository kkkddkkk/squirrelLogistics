import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  lighten,
} from "@mui/material";
import { ReportProblemOutlined as ReportProblemOutlinedIcon } from "@mui/icons-material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ProfileImage from "../../components/driver/ProfileImage";
import SNSReAuthModal from "../../components/driver/SNSReAuthModal";
import EmergencyReportModal from "../../components/driver/EmergencyReportModal";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import LoadingComponent from "../../components/common/LoadingComponent";
import { theme } from "../../components/common/CommonTheme";
import {
  CommonTitle,
  CommonSubTitle,
} from "../../components/common/CommonText";
import {
  getDriverProfile,
  deleteAccount,
  verifyPassword,
} from "../../api/driver/driverApi";
import { fetchRegisterReport } from "../../api/company/reportApi";

const DriverProfile = () => {
  const thisTheme = useTheme();
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
    insurance: false,
    insuranceRenewalDate: "",
    driverImageUrl: ""
  });

  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSNSReAuthModal, setShowSNSReAuthModal] = useState(false);
  const [showEmergencyReportModal, setShowEmergencyReportModal] =
    useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginType, setLoginType] = useState("EMAIL"); // EMAIL: 일반 로그인, GOOGLE: 구글 로그인, KAKAO: 카카오 로그인
  const [hasSetPassword, setHasSetPassword] = useState(false); // SNS 로그인 사용자의 비밀번호 설정 여부
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // EditProfile에서 전달받은 state 처리
  // useEffect(() => {
  //   if (
  //     location.state?.fromEditProfile &&
  //     location.state?.updatedProfileImage
  //   ) {
  //     console.log(
  //       "EditProfile에서 전달받은 프로필 이미지:",
  //       location.state.updatedProfileImage.substring(0, 50) + "..."
  //     );
  //     console.log("타임스탬프:", location.state.timestamp);

  //     // 즉시 이미지 URL 설정
  //     setProfileImageUrl(location.state.updatedProfileImage);
  //     localStorage.setItem(
  //       "profileImageUrl",
  //       location.state.updatedProfileImage
  //     );

  //     // state 초기화 (중복 처리 방지)
  //     window.history.replaceState({}, document.title);
  //   }
  // }, [location.state]);

  //수정: 김도경
  //페이지 로드 시 데이터 가져오기

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

        // console.log("디버깅 정보:", {
        //   accessToken: accessToken ? "있음" : "없음",
        //   userRole: userRole,
        //   userName: userName,
        // });

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

        const driverId = driverData.driverId;
        // console.log("가져온 기사 프로필 데이터:", driverData);
        // console.log("userDTO 데이터:", driverData.userDTO);

        // API 응답 데이터를 컴포넌트 상태에 맞게 변환
        setDriver({
          id: driverData.driverId || "",
          name: driverData.userDTO?.name || "",
          birth: driverData.userDTO?.birthday || "",
          phone: driverData.userDTO?.pnumber || "",
          email: driverData.userDTO?.email || "",
          bankAccount: driverData.userDTO?.account || "",
          businessId: driverData.userDTO?.businessN || "",
          unavailableStart: "", // API에 없는 필드
          unavailableEnd: "", // API에 없는 필드
          deliveryArea: driverData.mainLoca || "",
          profileImageUrl: driverData.profileImageUrl
        });

        // console.log("설정된 driver 상태:", {
        //   name: driverData.userDTO?.name || "",
        //   phone: driverData.userDTO?.pnumber || "",
        //   email: driverData.userDTO?.email || "",
        // });

        // 프로필 이미지 설정
        if (driverData.profileImageUrl) {
          // console.log(
          //   "백엔드에서 받은 프로필 이미지 URL:",
          //   driverData.profileImageUrl
          // );
          // 백엔드 URL이 data URL인 경우에만 사용
          if (driverData.profileImageUrl.startsWith("data:image")) {
            setProfileImageUrl(driverData.profileImageUrl);
            // localStorage.setItem("profileImageUrl", driverData.profileImageUrl);
          } else {
            // 백엔드 URL이 data URL이 아닌 경우 localStorage에서 data URL 확인
            const savedDataUrl = localStorage.getItem("profileImageUrl");
            if (savedDataUrl && savedDataUrl.startsWith("data:image")) {
              // console.log(
              //   "localStorage에서 data URL 사용:",
              //   savedDataUrl.substring(0, 50) + "..."
              // );
              setProfileImageUrl(savedDataUrl);
            } else {
              setProfileImageUrl(driverData.profileImageUrl);
              // localStorage.setItem(
              //   "profileImageUrl",
              //   driverData.profileImageUrl
              // );
            }
          }
        } else {
          // 저장된 프로필 이미지 로드
          const savedImageUrl = localStorage.getItem("profileImageUrl");
          if (savedImageUrl) {
            // console.log(
            //   "localStorage에서 로드한 프로필 이미지 URL:",
            //   savedImageUrl.substring(0, 50) + "..."
            // );
            setProfileImageUrl(savedImageUrl);
          } else {
            // 프로필 이미지가 없으면 빈 문자열로 설정 (기본 Person 아이콘 표시)
            //console.log("프로필 이미지 없음, 기본 아이콘 표시");
            setProfileImageUrl("");
          }
        }

        // SNS 로그인 여부 확인 (loginId 패턴으로 판단)
        // google_로 시작하면 SNS 로그인, 아니면 일반 로그인
        const loginId = driverData.userDTO?.loginId || "";
        const isSnsLogin =
          loginId.startsWith("google_") || loginId.startsWith("kakao_");

        if (isSnsLogin) {
          // 카카오와 구글 로그인 구분
          if (loginId.startsWith("kakao_")) {
            //console.log("카카오 로그인 사용자로 설정:", loginId);
            setLoginType("KAKAO"); // 카카오 로그인 사용자
          } else if (loginId.startsWith("google_")) {
            //console.log("구글 로그인 사용자로 설정:", loginId);
            setLoginType("GOOGLE"); // 구글 로그인 사용자
          }
          setHasSetPassword(false); // SNS 로그인 사용자는 비밀번호 설정 여부 확인 필요
        } else {
          //console.log("일반 로그인 사용자로 설정:", loginId);
          setLoginType("EMAIL"); // 일반 로그인 사용자
          setHasSetPassword(true); // 일반 로그인 사용자는 비밀번호가 있음
        }
      } catch (error) {
        //console.error("기사 프로필 조회 실패:", error);
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
          // 보험 관련 필드는 백엔드에 아직 구현되지 않음
          // insurance: false,
          // insuranceRenewalDate: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  useEffect(() => {
    if (driver.name === "") return;
    setProfileImageUrl(driver.profileImageUrl);
    //console.log("profileImageUrl: " + profileImageUrl);
  }, [driver])

  const handleHeaderEmergencyReport = () => {
    setShowEmergencyReportModal(true);
  };

  const handleEmergencyReport = (reportData) => {

    setLoading(true);
    fetchRegisterReport({ reportData })
      .then((data) => {
        //console.log(data);
      })
      .catch((e) => {
        const errBody = e.response?.data;
        setError(errBody?.message ?? e.message);
      })
      .finally(() => {
        setLoading(false);
        navigate(`/driver/reportlist`);

      });
  };

  if (loading) {
    return <LoadingComponent open={true} text="프로필 정보를 불러오는 중..." />;
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" align="center" color="error">
            {error}
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!driver) return <div>데이터를 불러올 수 없습니다.</div>;

  // 사용자 정보가 없거나 기본값인지 확인하는 함수
  const hasUserInfo = () => {
    return (
      driver.name &&
      driver.name.trim() !== "" &&
      driver.phone &&
      driver.phone.trim() !== "" &&
      driver.email &&
      driver.email.trim() !== ""
    );
  };

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
        //console.error("회원 탈퇴 실패:", error);
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
      //console.error("비밀번호 확인 실패:", error);
      setPasswordError("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
  };

  return (
    <Box sx={{
      bgcolor: thisTheme.palette.background.default,
      minHeight: "100vh",
    }}>
      <Header />
      <Container sx={{ maxWidth: "1000px", py: 6 }}>
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
              color: thisTheme.palette.primary.main,
              // "&:hover": { color: "#34699A" },
              fontSize: "1rem",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            수정하기
          </Button>

          <Box mb={4}>
            <CommonTitle>운전자 개인 정보</CommonTitle>
          </Box>

          {/* 2단 레이아웃 */}
          <Box display="flex" sx={{
            minHeight: "800px",
            border: "1px solid",
            borderColor: thisTheme.palette.mode === "light"
              ? thisTheme.palette.secondary.light
              : thisTheme.palette.primary.dark,
          }}>
            {/* 왼쪽 컬럼 - 어두운 배경 */}
            <Box
              sx={{
                width: "35%",
                bgcolor: thisTheme.palette.primary.main,
                color: "white",
                p: 5,
                display: "flex",
                flexDirection: "column",

              }}
            >
              {/* 프로필 사진 */}
              <Box display="flex" justifyContent="center" mb={4}>
                <ProfileImage
                  imageUrl={`http://localhost:8080/api/public/driverImage/${profileImageUrl}`}
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
              {hasUserInfo() ? (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ mb: 2, color: "white" }}
                    >
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
                        <Typography variant="body1" fontWeight="normal">
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
                        <Typography variant="body1" fontWeight="normal">
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
                        <Typography variant="body1" fontWeight="normal">
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
                        <Typography variant="body1" fontWeight="normal">
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
                        <Typography variant="body1" fontWeight="normal">
                          {driver.businessId}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </>
              ) : (
                /* 개인정보가 없는 경우 등록 버튼 표시 */
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <Button
                    onClick={() => {
                      if (loginType === "GOOGLE" || loginType === "KAKAO") {
                        setShowSNSReAuthModal(true);
                      } else {
                        navigate("/driver/editprofile");
                      }
                    }}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: thisTheme.palette.background.default,
                      color: thisTheme.palette.primary.main,
                      py: 2,
                      // "&:hover": {
                      //   bgcolor: "rgba(255,255,255,0.9)",
                      // },
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    개인정보를 등록해주세요 <EditIcon sx={{ fontSize: 23 }} />
                  </Button>
                </Box>
              )}

              {/* 버튼들 */}
              <Box sx={{ mt: "auto" }}>
                <Stack spacing={3}>
                  <Button
                    onClick={() => {
                      navigate(`/driver/review`);
                    }}
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      borderWidth: 1,
                      py: 2,
                      "&:hover": {
                        // backgroundColor: "white",
                        // color: "#113F67",
                        // borderColor: "white",
                        outline: 2,
                      },
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    나의 리뷰 보기
                  </Button>
                  <Button
                    onClick={() => navigate(`/driver/reportlist`)}
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      borderWidth: 1,
                      py: 2,
                      "&:hover": {
                        outline: 2,
                      },
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    신고 목록 보기
                  </Button>
                  <Button
                    onClick={handleHeaderEmergencyReport}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: thisTheme.palette.error.main,
                      color: thisTheme.palette.text.primary,
                      py: 2,
                      "&:hover": {
                        bgcolor: lighten(thisTheme.palette.error.main, 0.1),
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
                bgcolor: thisTheme.palette.background.paper,
                p: 5,
                // border: `1px solid ${thisTheme.palette.text.secondary}`,
              }}
            >
              {/* 차량 정보 */}
              <Box sx={{ mb: 5 }}>
                <Box sx={{ mb: 4 }}>
                  <CommonSubTitle>차량 정보</CommonSubTitle>
                </Box>

                {/* 항상 "차량 조회하기" 버튼으로 표시 */}
                <Box
                  sx={{
                    p: 10,
                    bgcolor: thisTheme.palette.mode === "light"
                      ? thisTheme.palette.secondary.light
                      : thisTheme.palette.background.default,
                    borderRadius: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: thisTheme.palette.background.paper,
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
                  <LocalShippingIcon
                    sx={{
                      fontSize: 100,
                      mb: 3,
                      color: thisTheme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="h4"
                    color={thisTheme.palette.text.secondary}
                    sx={{ mb: 3, fontWeight: "bold" }}
                  >
                    차량 조회하기
                  </Typography>
                  <Typography variant="h6" color={thisTheme.palette.text.secondary}>
                    차량 정보를 조회하고 관리할 수 있습니다
                  </Typography>
                </Box>
              </Box>

              {/* 일정 관리 */}
              <Box>
                <Box sx={{ mb: 4 }}>
                  <CommonSubTitle>일정 관리</CommonSubTitle>
                </Box>
                <Box
                  sx={{
                    p: 10,
                    bgcolor: thisTheme.palette.background.default,
                    borderRadius: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: thisTheme.palette.background.paper,
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                  onClick={() => {
                    const currentDate = new Date();
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    navigate(`/driver/calendar/${year}/${month}`);
                  }}
                >
                  <EditCalendarIcon
                    sx={{
                      fontSize: 100,
                      mb: 3,
                      color: thisTheme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="h4"
                    color={thisTheme.palette.text.secondary}
                    sx={{ mb: 3, fontWeight: "bold" }}
                  >
                    일정 관리하기
                  </Typography>
                  <Typography variant="h6" color={thisTheme.palette.text.secondary}>
                    달력에서 일정을 확인하고 관리할 수 있습니다
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 탈퇴 버튼 */}
        <Box display="flex" justifyContent="center">
          <Button
            variant={thisTheme.palette.mode === "light" ? "outlined" : "contained"}
            color="error"
            onClick={handleWithdraw}
            sx={{
              mt: 3,
              px: 4,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderWidth: 2,
              "&:hover": {
                bgcolor: lighten(thisTheme.palette.error.main, 0.1),
              },
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

      {/* 긴급 신고 모달 */}
      <EmergencyReportModal
        open={showEmergencyReportModal}
        onClose={() => setShowEmergencyReportModal(false)}
        presetCategory="EMERGENCY"
        driverId={driver.id}
        lockCategory={true}
        onReport={handleEmergencyReport}
      />
      <Footer />
    </Box>
  );
};

export default DriverProfile;
