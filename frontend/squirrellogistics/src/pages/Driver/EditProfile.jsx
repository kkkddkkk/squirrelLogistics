import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/driver/NavBar";
import ProfileImage from "../../components/driver/ProfileImage";
import {
  getDriverProfile,
  updateDriverProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
} from "../../api/driver/driverApi";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 인증 상태 확인 (비밀번호 확인으로 대체)
  const [verificationStatus, setVerificationStatus] = useState(
    localStorage.getItem("verificationStatus") === "true"
  );

  // VerificationPage에서 전달받은 현재 비밀번호
  const [currentPassword, setCurrentPassword] = useState(
    location.state?.verifiedPassword || ""
  );

  const [form, setForm] = useState({
    id: "", // 회원가입 시 입력한 아이디가 들어올 예정
    name: "",
    birth: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    bankAccount: "",
    businessId: "",
    unavailableStart: "",
    unavailableEnd: "",
    deliveryArea: "",
    rating: 0,
  });

  // 로딩 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("EMAIL");
  const [hasSetPassword, setHasSetPassword] = useState(false);

  // 페이지 로드 시 로그인한 사용자 정보 불러오기
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // localStorage 또는 sessionStorage에서 사용자 ID 가져오기
        const userLoginId =
          localStorage.getItem("userLoginId") ||
          sessionStorage.getItem("userLoginId");
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        console.log("accessToken 확인됨");

        // API를 통해 사용자 프로필 정보 가져오기
        const profileData = await getDriverProfile();

        console.log("가져온 프로필 데이터:", profileData);

        // 폼 데이터 설정
        setForm({
          id: profileData.userDTO?.loginId || userLoginId,
          name: profileData.userDTO?.name || "",
          birth: profileData.userDTO?.birthday || "",
          phone: profileData.userDTO?.pnumber || "",
          email: profileData.userDTO?.email || "",
          password: "",
          confirmPassword: "",
          bankAccount: profileData.userDTO?.account || "",
          businessId: profileData.userDTO?.businessN || "",
          unavailableStart: "",
          unavailableEnd: "",
          deliveryArea: profileData.mainLoca || "",
          rating: 0,
        });

        // 프로필 이미지 설정
        // localStorage에서 먼저 확인 (data URL 우선)
        const savedImageUrl = localStorage.getItem("profileImageUrl");
        if (savedImageUrl && savedImageUrl.startsWith("data:image")) {
          console.log(
            "localStorage에서 data URL 로드:",
            savedImageUrl.substring(0, 50) + "..."
          );
          setProfileImageUrl(savedImageUrl);
        } else if (profileData.profileImageUrl) {
          console.log(
            "백엔드에서 프로필 이미지 URL 로드:",
            profileData.profileImageUrl
          );
          setProfileImageUrl(profileData.profileImageUrl);
          // 백엔드 URL을 localStorage에 저장
          localStorage.setItem("profileImageUrl", profileData.profileImageUrl);
        } else {
          // 프로필 이미지가 없으면 빈 문자열로 설정 (기본 Person 아이콘 표시)
          console.log("프로필 이미지 없음, 기본 아이콘 표시");
          setProfileImageUrl("");
        }

        // 활동 지역 설정
        if (profileData.mainLoca) {
          setSelectedAreas([profileData.mainLoca]);
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

        setLoading(false);
      } catch (error) {
        console.error("프로필 로드 실패:", error);
        setError("프로필 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // 프로필 사진 관련 state
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

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

  // 프로필 사진 업로드 처리
  const handleImageUpload = async (file) => {
    console.log("handleImageUpload 호출됨:", file);

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

      try {
        console.log("이미지 업로드 시작:", file.name);

        // 먼저 로컬 미리보기 설정 (data URL 사용)
        setProfileImage(file);

        // FileReader를 사용하여 data URL 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          console.log("생성된 data URL:", dataUrl.substring(0, 50) + "...");
          setProfileImageUrl(dataUrl);
          localStorage.setItem("profileImageUrl", dataUrl);
        };
        reader.readAsDataURL(file);

        // 백엔드 API 호출은 별도로 처리 (성공/실패와 관계없이 미리보기는 유지)
        try {
          console.log("API 호출 시작...");
          const uploadedImageUrl = await uploadProfileImage(file);
          console.log("API 응답:", uploadedImageUrl);

          // API 성공 시 백엔드 URL도 저장 (선택사항)
          if (uploadedImageUrl) {
            localStorage.setItem("backendProfileImageUrl", uploadedImageUrl);
          }
        } catch (apiError) {
          console.error("백엔드 업로드 실패 (미리보기는 유지):", apiError);
          // 백엔드 업로드 실패해도 미리보기는 유지
        }

        console.log("이미지 업로드 완료");
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다: " + error.message);

        // 업로드 실패 시 로컬 미리보기도 제거
        setProfileImage(null);
        setProfileImageUrl("");
        localStorage.removeItem("profileImageUrl");
      }
    }
  };

  // 프로필 사진 삭제
  const handleImageDelete = async () => {
    try {
      // 로컬 상태 초기화
      setProfileImage(null);
      setProfileImageUrl("");
      localStorage.removeItem("profileImageUrl");

      // 백엔드에 빈 이미지 URL로 업데이트 요청
      const emptyImageFile = new File([""], "empty.jpg", {
        type: "image/jpeg",
      });
      await deleteProfileImage(); // 새로 추가된 API 호출

      console.log("프로필 이미지 삭제 완료");
    } catch (error) {
      console.error("프로필 이미지 삭제 실패:", error);
      alert("프로필 이미지 삭제에 실패했습니다.");
    }
  };

  // 컴포넌트 마운트 시 저장된 프로필 이미지 로드 및 사용자 정보 로드
  React.useEffect(() => {
    const savedImageUrl = localStorage.getItem("profileImageUrl");
    if (savedImageUrl) {
      setProfileImageUrl(savedImageUrl);
    }

    // 로그인한 사용자의 아이디 가져오기 (실제로는 API 호출)
    const userLoginId =
      localStorage.getItem("userLoginId") ||
      sessionStorage.getItem("userLoginId");
    if (userLoginId) {
      setForm((prev) => ({ ...prev, id: userLoginId }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // SNS 로그인 사용자이고 비밀번호를 설정하지 않은 경우 비밀번호 검증 건너뛰기
    const isSnsUserWithoutPassword =
      (loginType === "GOOGLE" || loginType === "KAKAO") && !hasSetPassword;

    if (!isSnsUserWithoutPassword) {
      // 일반 로그인 사용자 또는 SNS 로그인에서 비밀번호를 설정한 사용자는 비밀번호 검증 필요
      if (!form.password || form.password.trim() === "") {
        alert("비밀번호를 입력해주세요.");
        return;
      }
      if (!form.confirmPassword || form.confirmPassword.trim() === "") {
        alert("비밀번호를 입력해주세요.");
        return;
      }
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

    try {
      // API 요청 데이터 구성
      const profileData = {
        name: form.name,
        email: form.email,
        phone: form.phone, // 백엔드에서 Pnumber로 매핑됨
        account: form.bankAccount,
        businessN: form.businessId,
        mainLoca: form.deliveryArea,
        // 기존 데이터 유지를 위한 필드들 (null로 설정하여 기존 값 유지)
        loginId: null, // 기존 값 유지
        password: null, // 기존 값 유지 (별도 API로 처리)
        birthday: null, // 기존 값 유지
        licenseNum: null, // 기존 값 유지
        licenseDT: null, // 기존 값 유지
        drivable: null, // 기존 값 유지
        preferred_start_time: null, // 기존 값 유지
        preferred_end_time: null, // 기존 값 유지
        vehicleTypeId: null, // 기존 값 유지
        carNum: null, // 기존 값 유지
        agreeTerms: null, // 기존 값 유지
      };

      console.log("프로필 수정 요청 데이터:", profileData);

      // 프로필 정보 업데이트
      await updateDriverProfile(profileData);

      // 비밀번호 수정 처리
      if (form.password && form.password.trim() !== "") {
        console.log("비밀번호 수정 시작");
        try {
          // 현재 비밀번호는 인증 페이지에서 이미 확인했으므로,
          // 새로운 비밀번호만 전달 (백엔드에서 현재 비밀번호 확인 로직 필요)
          await changePassword(currentPassword, form.password); // 현재 비밀번호는 빈 문자열로 전달
          console.log("비밀번호 수정 성공");
        } catch (passwordError) {
          console.error("비밀번호 수정 실패:", passwordError);
          alert(
            "비밀번호 수정에 실패했습니다: " +
              (passwordError.response?.data || passwordError.message)
          );
          return;
        }
      }

      // SNS 로그인 사용자가 비밀번호를 설정한 경우 저장
      if (
        (loginType === "GOOGLE" || loginType === "KAKAO") &&
        !hasSetPassword &&
        form.password
      ) {
        localStorage.setItem("hasSetPassword", "true");
        localStorage.setItem("snsUserPassword", form.password);
      }

      alert("수정이 완료되었습니다.");

      // 인증 상태 초기화
      localStorage.removeItem("verificationStatus");
      localStorage.removeItem("verifiedPhone");
      localStorage.removeItem("verificationMethod");

      // Profile 페이지로 이동할 때 최신 프로필 이미지가 반영되도록 state 전달
      console.log("Profile 페이지로 이동, 전달할 이미지 URL:", profileImageUrl);
      navigate("/driver/profile", {
        state: {
          fromEditProfile: true,
          updatedProfileImage: profileImageUrl,
          timestamp: Date.now(), // 강제 리렌더링을 위한 타임스탬프
        },
      });
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert(
        "프로필 수정에 실패했습니다: " + (error.response?.data || error.message)
      );
    }
  };

  // 로딩 중이거나 에러가 있는 경우 처리
  if (loading) {
    return (
      <Box>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            회원 정보 수정
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "200px" }}
          >
            <Typography variant="h6">프로필 정보를 불러오는 중...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            회원 정보 수정
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "200px" }}
          >
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

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
              <ProfileImage
                imageUrl={profileImageUrl}
                alt="프로필 편집"
                size={120}
                editable={true}
                showEditIcon={false}
                onImageChange={handleImageUpload}
              />
              <Box display="flex" gap={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // 가장 간단하고 확실한 방법
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.style.display = "none";

                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                      // 메모리 정리
                      document.body.removeChild(input);
                    };

                    // DOM에 추가하고 클릭
                    document.body.appendChild(input);
                    input.click();
                  }}
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
                  사진 선택
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
              </Box>
            </Box>

            <TextField
              label="아이디"
              name="id"
              value={form.id}
              disabled
              fullWidth
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#000000",
                  WebkitTextFillColor: "#000000",
                },
              }}
            />
            {/* SNS 로그인 사용자이고 비밀번호를 설정하지 않은 경우 비밀번호 필드 숨김 */}
            {!(
              (loginType === "GOOGLE" || loginType === "KAKAO") &&
              !hasSetPassword
            ) && (
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
            )}

            {/* SNS 로그인 사용자이고 비밀번호를 설정하지 않은 경우 안내 메시지 */}
            {(loginType === "GOOGLE" || loginType === "KAKAO") &&
              !hasSetPassword && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    SNS 로그인 사용자입니다. 비밀번호 설정 없이 정보를 수정할 수
                    있습니다.
                  </Typography>
                </Box>
              )}

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
              disabled
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#000000",
                  WebkitTextFillColor: "#000000",
                },
              }}
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
