import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
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
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../Layout/Header";
import { CommonTitle } from "../../components/common/CommonText";

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const thisTheme = useTheme();

  // 인증 상태 확인 (비밀번호 확인으로 대체)
  const [verificationStatus, setVerificationStatus] = useState(
    localStorage.getItem("verificationStatus") === "true"
  );

  // VerificationPage에서 전달받은 현재 비밀번호
  const [currentPassword, setCurrentPassword] = useState(
    location.state?.verifiedPassword || ""
  );

  console.log("EditProfile 초기화 - location.state:", location.state);
  console.log(
    "EditProfile 초기화 - currentPassword:",
    location.state?.verifiedPassword
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
    insurance: false,
    insuranceRenewalDate: "",
    insuranceExpiryDate: "",
  });

  // 비밀번호 필드 관리를 위한 추가 state
  const [passwordPlaceholder, setPasswordPlaceholder] = useState("********"); // 현재 비밀번호 마스킹 표시
  const [isPasswordChanged, setIsPasswordChanged] = useState(false); // 비밀번호 변경 여부

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
          password: passwordPlaceholder, // 현재 비밀번호 마스킹 표시
          confirmPassword: passwordPlaceholder, // 현재 비밀번호 마스킹 표시
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

    // 일반 로그인 사용자의 경우에만 비밀번호 검증
    if (loginType === "EMAIL") {
      // 비밀번호 검증
      if (name === "password") {
        // 마스킹된 비밀번호 클리어 (사용자가 처음 입력할 때)
        if (value !== passwordPlaceholder && !isPasswordChanged) {
          setIsPasswordChanged(true);
        }

        // 실제 비밀번호가 입력된 경우에만 검증
        if (value !== passwordPlaceholder && value.length > 0) {
          // 비밀번호 정규식: 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          const isValidPassword = passwordRegex.test(value);
          setPasswordError(
            isValidPassword ? "" : "*비밀번호 형식이 올바르지 않습니다."
          );

          // 비밀번호 확인 필드도 검증
          if (
            form.confirmPassword &&
            form.confirmPassword !== passwordPlaceholder &&
            value !== form.confirmPassword
          ) {
            setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
          } else {
            setPasswordConfirmError("");
          }
        } else {
          // 마스킹된 값이면 에러 없음
          setPasswordError("");
        }
      }

      // 비밀번호 확인 검증
      if (name === "confirmPassword") {
        // 마스킹된 비밀번호 클리어 (사용자가 처음 입력할 때)
        if (value !== passwordPlaceholder && !isPasswordChanged) {
          setIsPasswordChanged(true);
        }

        if (
          form.password &&
          form.password !== passwordPlaceholder &&
          value !== passwordPlaceholder &&
          value !== form.password
        ) {
          setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
        } else {
          setPasswordConfirmError("");
        }
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 비밀번호 필드 포커스 핸들러 (마스킹된 값 클리어)
  const handlePasswordFocus = (fieldName) => {
    if (!isPasswordChanged) {
      setForm((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
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
    console.log("handleSubmit 호출됨 - timestamp:", Date.now());

    // 운행불가 시작일/종료일과 선호시간대를 제외한 필수 필드 검증
    const requiredFields = {
      name: "이름",
      email: "이메일",
      phone: "연락처",
      bankAccount: "계좌번호",
      businessId: "사업자등록번호",
      deliveryArea: "운행선호지역",
    };

    // 필수 필드 검증
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field] || form[field].trim() === "") {
        alert(`${label}을(를) 입력해주세요.`);
        return;
      }
    }

    // 이메일 형식 검증
    if (emailError) {
      alert("이메일 형식을 확인해주세요.");
      return;
    }

    // 일반 로그인 사용자의 경우 비밀번호 검증 (변경된 경우에만)
    if (loginType === "EMAIL" && isPasswordChanged) {
      if (
        !form.password ||
        form.password.trim() === "" ||
        form.password === passwordPlaceholder
      ) {
        alert("새로운 비밀번호를 입력해주세요.");
        return;
      }
      if (
        !form.confirmPassword ||
        form.confirmPassword.trim() === "" ||
        form.confirmPassword === passwordPlaceholder
      ) {
        alert("비밀번호 확인을 입력해주세요.");
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
    }

    try {
      // API 요청 데이터 구성
      const profileData = {
        name: form.name,
        email: form.email,
        phone: form.phone, // 백엔드에서 Pnumber로 매핑됨
        account: form.bankAccount || "",
        businessN: form.businessId,
        mainLoca: form.deliveryArea,
        // 보험 관련 필드는 백엔드에 아직 구현되지 않음
        // insurance: form.insurance,
        // insuranceRenewalDate:
        //   form.insuranceRenewalDate && form.insuranceRenewalDate.trim() !== ""
        //     ? dayjs(form.insuranceRenewalDate).toDate()
        //     : null,
        // insuranceExpiryDate:
        //   form.insuranceExpiryDate && form.insuranceExpiryDate.trim() !== ""
        //     ? dayjs(form.insuranceExpiryDate).toDate()
        //     : null,
        // 기존 데이터 유지를 위한 필드들 (null로 설정하여 기존 값 유지)
        loginId: null, // 기존 값 유지
        password: null, // 기존 값 유지 (별도 API로 처리)
        birthday: form.birth ? dayjs(form.birth).toDate() : null, // 생년월일 업데이트
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

      // 일반 로그인 사용자의 경우 비밀번호 수정 처리 (실제로 변경된 경우에만)
      if (
        loginType === "EMAIL" &&
        isPasswordChanged &&
        form.password &&
        form.password.trim() !== "" &&
        form.password !== passwordPlaceholder
      ) {
        console.log("비밀번호 수정 시작");
        console.log("currentPassword:", currentPassword);
        console.log("newPassword:", form.password);

        if (!currentPassword || currentPassword.trim() === "") {
          alert(
            "현재 비밀번호가 확인되지 않았습니다. 다시 비밀번호 확인을 진행해주세요."
          );
          return;
        }

        try {
          await changePassword(currentPassword, form.password);
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

      console.log("수정 완료 알럿 표시 - timestamp:", Date.now());
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

      // 에러 메시지 추출
      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert("프로필 수정에 실패했습니다: " + errorMessage);
    }
  };

  // 로딩 중이거나 에러가 있는 경우 처리
  if (loading) {
    return (
      <Box>
        <Header />
        <CommonTitle>회원 정보 수정</CommonTitle>
        <Container maxWidth="sm" sx={{ py: 4 }}>

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
        <Header />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <CommonTitle>회원 정보 수정</CommonTitle>
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
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <CommonTitle>회원 정보 수정</CommonTitle>
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
                sx={{ mb: 2, color: thisTheme.palette.primary.main }}
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
                  color={thisTheme.palette.primary.main}
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
                    borderColor: thisTheme.palette.primary.main,
                    color: thisTheme.palette.primary.main,
                    "&:hover": {
                      borderColor: thisTheme.palette.primary.main,
                      bgcolor: thisTheme.palette.primary.main,
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
                      borderColor: thisTheme.palette.error.main,
                      color: thisTheme.palette.error.main,
                      "&:hover": {
                        borderColor: thisTheme.palette.error.main,
                        bgcolor: thisTheme.palette.error.main,
                        color: "white",
                      },
                    }}
                  >
                    삭제
                  </Button>
                )}
              </Box>
            </Box>

            {/* SNS 로그인 사용자는 아이디 필드 숨김 */}
            {(loginType === "EMAIL" ||
              ((loginType === "GOOGLE" || loginType === "KAKAO") &&
                hasSetPassword)) && (
                <TextField
                  label="아이디"
                  name="id"
                  value={form.id}
                  disabled
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: thisTheme.palette.text.primary,
                      WebkitTextFillColor: thisTheme.palette.text.primary,
                    },
                  }}
                />
              )}
            {/* SNS 로그인 사용자는 비밀번호 필드 숨김 */}
            {loginType === "EMAIL" && (
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <TextField
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => handlePasswordFocus("password")}
                    error={!!passwordError}
                    placeholder="비밀번호를 입력해주세요."
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
                    onFocus={() => handlePasswordFocus("confirmPassword")}
                    error={!!passwordConfirmError}
                    placeholder="비밀번호를 다시 입력해주세요."
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
            <TextField
              label="계좌번호"
              name="bankAccount"
              value={form.bankAccount}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="사업자 등록 번호"
              name="businessId"
              value={form.businessId}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="운행 불가 시작일"
                  name="unavailableStart"
                  type="date"
                  value={form.unavailableStart}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="운행 불가 종료일"
                  name="unavailableEnd"
                  type="date"
                  value={form.unavailableEnd}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            </Box>

            {/* 보험 관련 섹션 - 백엔드에 아직 구현되지 않음 */}
            {/* <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.insurance}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          insurance: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="보험 가입"
                />
              </div>
            </Box>

            {form.insurance && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="보험 갱신일"
                    type="date"
                    fullWidth
                    value={form.insuranceRenewalDate || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        insuranceRenewalDate: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="보험 만료일"
                    type="date"
                    fullWidth
                    value={form.insuranceExpiryDate || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        insuranceExpiryDate: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              </Box>
            )} */}

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
    </Box>
  );
};

export default EditProfile;
