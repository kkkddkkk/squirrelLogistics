import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/driver/NavBar";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Modal,
  Tabs,
  Tab,
  Chip,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Stack,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

const EditProfile = () => {
  const navigate = useNavigate();

  // 인증 상태 확인 (비밀번호 확인으로 대체)
  /*
  React.useEffect(() => {
    const verificationStatus = localStorage.getItem("verificationStatus");
    if (verificationStatus !== "verified") {
      alert("본인인증이 필요합니다.");
      navigate("/driver/verification");
      return;
    }
  }, [navigate]);
  */

  const [form, setForm] = useState({
    name: "김동현",
    birth: "1989-02-19",
    phone: "010-2342-2342",
    email: "driver119@naver.com",
    password: "",
    confirmPassword: "",
    bankAccount: "3333-1988-67613",
    businessId: "123-222-2342",
    unavailableStart: "2025-08-10",
    unavailableEnd: "2025-08-20",
    deliveryArea: "서울 전체",
    rating: 4.8,
  });

  // 프로필 사진 관련 state
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const fileInputRef = useRef(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [idError, setIdError] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);

  const [selectedCity, setSelectedCity] = useState("서울");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(["서울 전체"]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("은행 선택");
  const [activeTab, setActiveTab] = useState(0);

  // 은행 데이터
  const banks = [
    { name: "NH농협", logo: "🏦" },
    { name: "KB국민", logo: "🏦" },
    { name: "신한", logo: "🏦" },
    { name: "우리", logo: "🏦" },
    { name: "하나", logo: "🏦" },
    { name: "IBK기업", logo: "🏦" },
    { name: "부산", logo: "🏦" },
    { name: "경남", logo: "🏦" },
    { name: "대구", logo: "🏦" },
    { name: "우체국", logo: "🏦" },
    { name: "새마을금고", logo: "🏦" },
    { name: "SC제일", logo: "🏦" },
  ];
  // 증권사 데이터
  const securities = [
    { name: "NH투자증권", logo: "📈" },
    { name: "KB증권", logo: "📈" },
    { name: "신한투자증권", logo: "📈" },
    { name: "우리투자증권", logo: "📈" },
    { name: "하나증권", logo: "📈" },
    { name: "IBK투자증권", logo: "📈" },
  ];
  // 도시별 구/군 데이터
  const cityDistricts = {
    서울: [
      "서울 전체",
      "강남구",
      "강동구",
      "강북구",
      "강서구",
      "관악구",
      "광진구",
      "구로구",
      "금천구",
      "노원구",
      "도봉구",
      "동대문구",
      "동작구",
      "마포구",
      "서대문구",
      "서초구",
      "성동구",
      "성북구",
      "송파구",
      "양천구",
      "영등포구",
      "용산구",
      "은평구",
      "종로구",
      "중구",
      "중랑구",
    ],
    인천: [
      "인천 전체",
      "계양구",
      "남구",
      "남동구",
      "동구",
      "부평구",
      "서구",
      "연수구",
      "중구",
      "강화군",
      "옹진군",
    ],
    부산: [
      "부산 전체",
      "강서구",
      "금정구",
      "남구",
      "동구",
      "동래구",
      "부산진구",
      "북구",
      "사상구",
      "사하구",
      "서구",
      "수영구",
      "연제구",
      "영도구",
      "중구",
      "해운대구",
      "기장군",
    ],
    대구: [
      "대구 전체",
      "남구",
      "달서구",
      "달성군",
      "동구",
      "북구",
      "서구",
      "수성구",
      "중구",
    ],
    광주: ["광주 전체", "광산구", "남구", "동구", "북구", "서구"],
    대전: ["대전 전체", "대덕구", "동구", "서구", "유성구", "중구"],
    울산: ["울산 전체", "남구", "동구", "북구", "울주군", "중구"],
    세종: ["세종 전체"],
    경기: [
      "경기 전체",
      "수원시",
      "성남시",
      "의정부시",
      "안양시",
      "부천시",
      "광명시",
      "평택시",
      "동두천시",
      "안산시",
      "고양시",
      "과천시",
      "구리시",
      "남양주시",
      "오산시",
      "시흥시",
      "군포시",
      "의왕시",
      "하남시",
      "용인시",
      "파주시",
      "이천시",
      "안성시",
      "김포시",
      "화성시",
      "광주시",
      "여주시",
      "양평군",
      "고양군",
      "연천군",
      "포천군",
      "가평군",
    ],
    강원: [
      "강원 전체",
      "춘천시",
      "원주시",
      "강릉시",
      "동해시",
      "태백시",
      "속초시",
      "삼척시",
      "홍천군",
      "횡성군",
      "영월군",
      "평창군",
      "정선군",
      "철원군",
      "화천군",
      "양구군",
      "인제군",
      "고성군",
      "양양군",
    ],
    충북: [
      "충북 전체",
      "청주시",
      "충주시",
      "제천시",
      "보은군",
      "옥천군",
      "영동군",
      "증평군",
      "진천군",
      "괴산군",
      "음성군",
      "단양군",
    ],
    충남: [
      "충남 전체",
      "천안시",
      "공주시",
      "보령시",
      "아산시",
      "서산시",
      "논산시",
      "계룡시",
      "당진시",
      "금산군",
      "부여군",
      "서천군",
      "청양군",
      "홍성군",
      "예산군",
      "태안군",
    ],
    전북: [
      "전북 전체",
      "전주시",
      "군산시",
      "익산시",
      "정읍시",
      "남원시",
      "김제시",
      "완주군",
      "진안군",
      "무주군",
      "장수군",
      "임실군",
      "순창군",
      "고창군",
      "부안군",
    ],
    전남: [
      "전남 전체",
      "목포시",
      "여수시",
      "순천시",
      "나주시",
      "광양시",
      "담양군",
      "곡성군",
      "구례군",
      "고흥군",
      "보성군",
      "화순군",
      "장흥군",
      "강진군",
      "해남군",
      "영암군",
      "무안군",
      "함평군",
      "영광군",
      "장성군",
      "완도군",
      "진도군",
      "신안군",
    ],
    경북: [
      "경북 전체",
      "포항시",
      "경주시",
      "김천시",
      "안동시",
      "구미시",
      "영주시",
      "영천시",
      "상주시",
      "문경시",
      "경산시",
      "군위군",
      "의성군",
      "청송군",
      "영양군",
      "영덕군",
      "청도군",
      "고령군",
      "성주군",
      "칠곡군",
      "예천군",
      "봉화군",
      "울진군",
      "울릉군",
    ],
    경남: [
      "경남 전체",
      "창원시",
      "진주시",
      "통영시",
      "사천시",
      "김해시",
      "밀양시",
      "거제시",
      "양산시",
      "의령군",
      "함안군",
      "창녕군",
      "고성군",
      "남해군",
      "하동군",
      "산청군",
      "함양군",
      "거창군",
      "합천군",
    ],
    제주: ["제주 전체", "제주시", "서귀포시"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 아이디 변경 시 중복확인 초기화
    if (name === "id") {
      setIsIdChecked(false);
      setIdError("");
    }

    if (name === "phone") {
      let formatted = value.replace(/[^0-9]/g, "");
      if (formatted.length < 4) {
        formatted = formatted;
      } else if (formatted.length < 8) {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
      } else {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(
          3,
          7
        )}-${formatted.slice(7, 11)}`;
      }
      setForm((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === "email") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(isValidEmail ? "" : "이메일 형식이 올바르지 않습니다.");
    }

    // 비밀번호 검증
    if (name === "password") {
      // 비밀번호 정규식: 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const isValidPassword = passwordRegex.test(value);
      setPasswordError(
        isValidPassword ? "" : "*비밀번호 형식이 올바르지 않습니다."
      );

      // 비밀번호 확인 필드도 검증
      if (form.confirmPassword && value !== form.confirmPassword) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordConfirmError("");
      }
    }

    // 비밀번호 확인 검증
    if (name === "confirmPassword") {
      if (form.password && value !== form.password) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordConfirmError("");
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 도시 선택 핸들러
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  // 구/군 선택 핸들러
  const handleDistrictSelect = (district) => {
    // 이미 선택된 지역인지 확인
    if (!selectedAreas.includes(district)) {
      setSelectedAreas((prev) => [...prev, district]);
      setForm((prev) => ({
        ...prev,
        deliveryArea: [...selectedAreas, district].join(", "),
      }));
    }
    setShowDistrictDropdown(false);
  };

  // 지역 삭제 핸들러
  const removeArea = (areaToRemove) => {
    const updatedAreas = selectedAreas.filter((area) => area !== areaToRemove);
    setSelectedAreas(updatedAreas);
    setForm((prev) => ({
      ...prev,
      deliveryArea: updatedAreas.join(", "),
    }));
  };

  // 은행/증권사 선택 핸들러
  const handleBankSelect = (bank) => {
    setSelectedBank(bank.name);
    setShowBankModal(false);
  };

  // 아이디 중복확인
  const handleIdCheck = () => {
    if (!form.id || form.id.trim() === "") {
      setIdError("아이디를 입력해주세요.");
      return;
    }

    // 실제로는 서버 API 호출이 필요하지만, 여기서는 테스트용으로 시뮬레이션
    const existingIds = ["test123", "driver119", "user001", "admin"]; // 기존 아이디 목록

    if (existingIds.includes(form.id)) {
      setIdError("이미 사용 중인 아이디입니다.");
      setIsIdChecked(false);
    } else {
      setIdError("");
      setIsIdChecked(true);
      alert("사용 가능한 아이디입니다.");
    }
  };

  // 프로필 사진 업로드 처리
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 검증 (이미지 파일만)
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setProfileImage(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImageUrl(imageUrl);

      // 로컬 스토리지에 이미지 URL 저장
      localStorage.setItem("profileImageUrl", imageUrl);
    }
  };

  // 프로필 사진 삭제
  const handleImageDelete = () => {
    setProfileImage(null);
    setProfileImageUrl("");
    localStorage.removeItem("profileImageUrl");

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 컴포넌트 마운트 시 저장된 프로필 이미지 로드
  React.useEffect(() => {
    const savedImageUrl = localStorage.getItem("profileImageUrl");
    if (savedImageUrl) {
      setProfileImageUrl(savedImageUrl);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!form.id || form.id.trim() === "") {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (!isIdChecked) {
      alert("아이디 중복확인을 해주세요.");
      return;
    }
    if (idError) {
      alert("사용할 수 없는 아이디입니다.");
      return;
    }

    if (!form.password || form.password.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (!form.confirmPassword || form.confirmPassword.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (emailError) {
      alert("이메일 형식을 확인해주세요.");
      return;
    }
    if (passwordError) {
      alert("비밀번호 형식을 확인해주세요.");
      return;
    }
    if (passwordConfirmError) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("수정이 완료되었습니다.");
    // 인증 상태 초기화
    localStorage.removeItem("verificationStatus");
    localStorage.removeItem("verifiedPhone");
    localStorage.removeItem("verificationMethod");
    navigate("/driver/profile");
  };

  return (
    <Box>
      <NavBar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          회원 정보 수정
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            {/* 프로필 사진 업로드 */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 2, color: "#113F67" }}
              >
                프로필 사진
              </Typography>
              <Box position="relative" sx={{ mb: 2 }}>
                <Avatar
                  src={profileImageUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: profileImageUrl ? "transparent" : "white",
                    border: "3px solid #E0E6ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon sx={{ fontSize: 70, color: "#113F67" }} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    borderColor: "#113F67",
                    color: "#113F67",
                    "&:hover": {
                      borderColor: "#0d2d4a",
                      bgcolor: "#113F67",
                      color: "white",
                    },
                  }}
                >
                  사진 업로드
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {profileImageUrl && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleImageDelete}
                    sx={{
                      borderColor: "#A20025",
                      color: "#A20025",
                      "&:hover": {
                        borderColor: "#8B001F",
                        bgcolor: "#A20025",
                        color: "white",
                      },
                    }}
                  >
                    삭제
                  </Button>
                )}
              </Stack>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="아이디"
                name="id"
                value={form.id}
                onChange={handleChange}
                error={!!idError}
                helperText={idError}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleIdCheck}
                disabled={!form.id || form.id.trim() === ""}
                sx={{
                  height: 56,
                  borderColor: "#113F67",
                  color: "#113F67",
                  "&:hover": {
                    borderColor: "#0d2d4a",
                    bgcolor: "#113F67",
                    color: "white",
                  },
                }}
              >
                중복확인
              </Button>
            </Box>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <TextField
                  label="비밀번호"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!passwordError}
                  fullWidth
                />
                {passwordError && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 0.5, fontSize: "0.75rem" }}
                  >
                    {passwordError}
                  </Typography>
                )}
              </Box>
              <Box flex={1}>
                <TextField
                  label="비밀번호 확인"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={!!passwordConfirmError}
                  fullWidth
                />
                {passwordConfirmError && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 0.5, fontSize: "0.75rem" }}
                  >
                    {passwordConfirmError}
                  </Typography>
                )}
              </Box>
            </Box>

            <TextField
              label="이름"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="생년월일"
              name="birth"
              type="date"
              value={form.birth}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="연락처"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="이메일"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!emailError}
              helperText={emailError}
              fullWidth
            />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowBankModal(true)}
                >
                  {selectedBank}
                </Button>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label="계좌번호"
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="사업자 등록 번호"
              name="businessId"
              value={form.businessId}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="운행 불가 시작일"
              name="unavailableStart"
              type="date"
              value={form.unavailableStart}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="운행 불가 종료일"
              name="unavailableEnd"
              type="date"
              value={form.unavailableEnd}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {/* 배송 가능 지역 선택 */}
            <FormControl fullWidth>
              <InputLabel>도시</InputLabel>
              <Select
                value={selectedCity}
                label="도시"
                onChange={handleCityChange}
              >
                {Object.keys(cityDistricts).map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
              fullWidth
            >
              구/군을 선택하세요
            </Button>
            <Modal
              open={showDistrictDropdown}
              onClose={() => setShowDistrictDropdown(false)}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  width: 300,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  구/군 선택
                </Typography>
                <Stack spacing={1}>
                  {cityDistricts[selectedCity]?.map((district, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleDistrictSelect(district)}
                      variant="text"
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {district}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Modal>
            {/* 선택된 지역들 표시 */}
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedAreas.map((area, idx) => (
                <Chip
                  key={idx}
                  label={area}
                  onDelete={() => removeArea(area)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box display="flex" justifyContent="space-between" pt={3}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/driver/profile")}
              >
                취소
              </Button>
              <Button variant="contained" type="submit">
                저장하기
              </Button>
            </Box>
          </Stack>
        </Box>
      </Container>
      {/* 은행/증권사 선택 모달 */}
      <Modal open={showBankModal} onClose={() => setShowBankModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            width: 350,
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Typography variant="h6">은행·증권사 선택</Typography>
            <IconButton onClick={() => setShowBankModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
          >
            <Tab label="은행" />
            <Tab label="증권사" />
          </Tabs>
          <Box p={2}>
            <Grid container spacing={2}>
              {(activeTab === 0 ? banks : securities).map((item, idx) => (
                <Grid item xs={3} key={idx}>
                  <Button
                    onClick={() => handleBankSelect(item)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor:
                          activeTab === 0 ? "primary.main" : "success.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                        fontSize: 24,
                      }}
                    >
                      {item.logo}
                    </Box>
                    <Typography variant="caption" align="center">
                      {item.name}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditProfile;
