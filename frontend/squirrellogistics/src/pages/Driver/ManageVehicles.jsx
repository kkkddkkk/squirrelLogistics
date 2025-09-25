import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  Snackbar,
  Container,
  Stack,
  useTheme,
  FormHelperText,
  lighten,
  useMediaQuery,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  DirectionsCar,
  CheckCircle,
  Warning,
  Error,
  ChevronRight,
} from "@mui/icons-material";
import { carApi, vehicleTypeApi } from "../../api/cars";
import PreferredTimeBlock from "../../components/Time/PreferredTimeBlock";
import PreferredAreasSelect from "../../components/Area/PreferredAreasSelect";
import {
  CommonSubTitle,
  CommonTitle,
} from "../../components/common/CommonText";
import CommonList from "../../components/common/CommonList";
import { theme } from "../../components/common/CommonTheme";
import dayjs from "dayjs";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import LoadingComponent from "../../components/common/LoadingComponent";
import { FONT_SIZE } from "../../components/deliveryRequest/ListComponent";

const helperProps = { sx: { minHeight: "20px" } }; // helperText 높이 고정

export default function ManageVehicles() {
  const thisTheme = useTheme();
  const [cars, setCars] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const C = {
    blue: thisTheme.palette.primary.main,
    gold: thisTheme.palette.error.main,
  };

  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedCar, setSelectedCar] = useState(null);
  //차량 상태값 제어.
  const VALID_STATUSES = ["OPERATIONAL", "MAINTENANCE"];
  //에러 송출용.
  const [formErrors, setFormErrors] = useState({});
  const isSmaller900 = useMediaQuery(thisTheme.breakpoints.down('md'));

  // Form 상태
  const [form, setForm] = useState({
    carId: "",
    carNum: "",
    vehicleTypeId: "",
    mileage: "",
    etc: "",
    inspection: "",
    carStatus: "OPERATIONAL",
    regDate: "",
    nextInspection: "",
    preferredStartTime: "",
    preferredEndTime: "",
    timeWindow: "07:00AM ~ 18:00PM",
    preferredAreas: [],
    mainLoca: "서울",
  });

  // 토큰 가져오기 (일반/OAuth 사용자 우선)
  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "test-token"
    );
  };

  // 차량 목록 조회
  const loadCars = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const carsData = await carApi.getMyCars(token);
      setCars(carsData);
    } catch (err) {
      console.error("차량 목록 조회 실패:", err);
      setError("차량 목록을 불러오는데 실패했습니다.");
      showSnackbar("차량 목록 조회 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  //차량 삭제
  const removeCars = async (id) => {
    try {
      setLoading(true);
      const token = getToken();
      const carsData = await carApi.deleteCar(id, token);
      setCars(carsData);
    } catch (err) {
      console.error("차량 목록 조회 실패:", err);
      setError("차량 목록을 불러오는데 실패했습니다.");
      showSnackbar("차량 목록 조회 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  // 차량 타입 목록 조회
  const loadVehicleTypes = async () => {
    try {
      const typesData = await vehicleTypeApi.getVehicleTypes();
      setVehicleTypes(typesData);
    } catch (err) {
      console.error("차량 타입 목록 조회 실패:", err);
      showSnackbar("차량 타입 목록 조회 실패", "error");
    }
  };

  useEffect(() => {
    loadVehicleTypes();
    loadCars();
  }, []);

  useEffect(() => {
    if (!form?.inspection) {
      setForm((prev) => ({ ...prev, nextInspection: "" }));
      return;
    }
    const next = dayjs(form.inspection).add(6, "month").format("YYYY-MM-DD");
    if (form.nextInspection !== next) {
      setForm((prev) => ({ ...prev, nextInspection: next }));
    }
  }, [form?.inspection]);

  // Snackbar 표시
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Snackbar 닫기
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const todayStr = dayjs().format("YYYY-MM-DD");
  // Dialog 열기
  const handleOpenDialog = (mode, car = null) => {
    setDialogMode(mode);
    setSelectedCar(car);

    if (mode === "edit" && car) {
      const inspectionStr = car.inspection
        ? dayjs(car.inspection).format("YYYY-MM-DD")
        : "";
      const nextInspectionStr = inspectionStr
        ? dayjs(inspectionStr).add(6, "month").format("YYYY-MM-DD")
        : "";

      setForm({
        // 수정 불가 영역
        carId: car.carId || "",
        carNum: car.carNum || "",
        vehicleTypeId: car.vehicleType?.vehicleTypeId || "",
        regDate: car.regDate
          ? dayjs(car.regDate).format("YYYY-MM-DD")
          : todayStr,

        // 일반 입력
        mileage: car.mileage?.toString() || "",
        etc: car.etc || "",
        inspection: inspectionStr,
        nextInspection: nextInspectionStr, // 읽기전용 표시용(인풋 아님)

        // 기본값
        carStatus: car.carStatus || "OPERATIONAL",
      });
    } else {
      setForm({
        // 수정 불가 영역
        carNum: "",
        vehicleTypeId: "",
        regDate: todayStr,

        // 일반 입력
        mileage: "",
        etc: "",
        inspection: "",
        nextInspection: "", // inspection 입력되면 자동 설정

        // 기본값
        carStatus: "OPERATIONAL",
      });
    }

    // if (mode === "edit" && car) {
    //   setForm({
    //     carNum: car.carNum || "",
    //     vehicleTypeId: car.vehicleType?.vehicleTypeId || "",
    //     mileage: car.mileage?.toString() || "",
    //     etc: car.etc || "",
    //     inspection: car.inspection
    //       ? dayjs(car.inspection).format("YYYY-MM-DD")
    //       : "",
    //     carStatus: car.carStatus || "OPERATIONAL",
    //     regDate: car.regDate ? dayjs(car.regDate).format("YYYY-MM-DD") : "",
    //     nextInspection: car.nextInspection
    //       ? dayjs(car.nextInspection).format("YYYY-MM-DD")
    //       : "",
    //     licenseNum: car.licenseNum || "",
    //     preferredStartTime: car.preferredStartTime || "",
    //     preferredEndTime: car.preferredEndTime || "",
    //     timeWindow: car.timeWindow || "07:00AM ~ 18:00PM",
    //     preferredAreas: car.preferredAreas || [],
    //     mainLoca: car.mainLoca || "서울",
    //   });
    // } else {
    //   setForm({
    //     carNum: "",
    //     vehicleTypeId: "",
    //     mileage: "",
    //     etc: "",
    //     inspection: "",
    //     carStatus: "OPERATIONAL",
    //     regDate: "",
    //     nextInspection: "",
    //     preferredStartTime: "",
    //     preferredEndTime: "",
    //     timeWindow: "07:00AM ~ 18:00PM",
    //     preferredAreas: [],
    //     mainLoca: "서울",
    //   });
    // }

    setDialogOpen(true);
  };

  // Dialog 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCar(null);
    setError("");
  };

  // Form 변경 처리
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 차량 저장 (생성/수정)
  const handleSaveCar = async () => {
    try {
      setError("");

      // 필수 필드 검증
      if (!validateForm()) return;
      // if (!form.vehicleTypeId) {
      //   setError("차종을 선택해주세요.");
      //   showSnackbar("차종을 선택해주세요.", "error");
      //   return;
      // }

      const token = getToken();
      // console.log("저장할 차량 데이터:", form);
      // console.log(
      //   "form.vehicleTypeId 타입:",
      //   typeof form.vehicleTypeId,
      //   "값:",
      //   form.vehicleTypeId
      // );
      // console.log(
      //   "form.mileage 타입:",
      //   typeof form.mileage,
      //   "값:",
      //   form.mileage
      // );
      // console.log("form.etc 타입:", typeof form.etc, "값:", form.etc);
      // console.log(
      //   "form.insurance 타입:",
      //   typeof form.insurance,
      //   "값:",
      //   form.insurance
      // );
      // console.log(
      //   "form.carStatus 타입:",
      //   typeof form.carStatus,
      //   "값:",
      //   form.carStatus
      // );
      // console.log(
      //   "form.inspection 타입:",
      //   typeof form.inspection,
      //   "값:",
      //   form.inspection
      // );

      const carData = {
        vehicleTypeId: Number(form.vehicleTypeId),
        carNum: form.carNum || null,
        mileage:
          form.mileage && form.mileage.trim() !== ""
            ? Number(form.mileage.replace(/,/g, ""))
            : 0,
        etc: form.etc || "",
        insurance: form.insurance || false,
        carStatus: form.carStatus || "OPERATIONAL",
        inspection: form.inspection
          ? dayjs(form.inspection).format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };

      // console.log("변환된 차량 데이터:", carData);
      // console.log("JSON.stringify(carData):", JSON.stringify(carData, null, 2));

      setLoading(true);
      if (dialogMode === "create") {
        await carApi.createCar(carData, token);
        showSnackbar("차량이 등록되었습니다.", "success");
      } else {
        await carApi.updateCar(selectedCar.carId, carData, token);
        showSnackbar("차량이 수정되었습니다.", "success");
      }
      setLoading(false);

      handleCloseDialog();
      loadCars();
    } catch (err) {
      console.error("차량 저장 실패:", err);
      console.error("에러 상세:", err.response?.data);
      console.error("에러 상태:", err.response?.status);
      console.error("에러 메시지:", err.message);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "차량 저장에 실패했습니다.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  // 차량 삭제
  const handleDeleteCar = async (carId) => {
    if (!window.confirm("등록된 차량을 삭제하시겠습니까?")) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      await carApi.deleteCar(carId, token);
      setLoading(false);

      showSnackbar("차량이 삭제되었습니다.", "success");
      handleCloseDialog();
      loadCars();
    } catch (err) {
      setLoading(false);

      console.error("차량 삭제 실패:", err);
      showSnackbar("차량 삭제 실패", "error");
    }
  };

  // 차량 상태 표시
  const getStatusChip = (status, isMobile) => {
    const statusMap = {
      OPERATIONAL: {
        label: "운행 가능",
        color: "success",
        icon: <CheckCircle />,
      },
      MAINTENANCE: { label: "정비중", color: "warning", icon: <Warning /> },
      RETIRED: { label: "폐차", color: "error", icon: <Error /> },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: "default",
      icon: null,
    };
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="medium"
        variant="outlined"
        sx={{
          fontSize: isMobile ? "0.7rem" : "0.9rem",
          height: isMobile ? 26 : 32,
          "& .MuiChip-icon": {
            fontSize: "1.1rem",
          },
        }}
      />
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!form.carNum?.trim()) {
      errors.carNum = "차량번호를 입력해주세요.";
    } else {
      if (!carNumChk(form.carNum?.trim())) {
        errors.carNum = "유효하지 않은 차량 번호입니다.";
      }
    }

    if (!form.vehicleTypeId) {
      errors.vehicleTypeId = "차종을 선택해주세요.";
    }
    if (!form.inspection) {
      errors.inspection = "마지막 정비일을 입력해주세요.";
    }
    if (!VALID_STATUSES.includes(form.carStatus)) {
      errors.carStatus = "차량 상태를 선택해주세요.";
    }

    const rawMileage = String(form.mileage ?? "").trim();
    if (rawMileage === "") {
      errors.mileage = "주행 거리를 입력해주세요.";
    } else if (!/^\d+$/.test(rawMileage)) {
      errors.mileage = "주행 거리는 0 이상의 정수만 가능합니다.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length) {
      showSnackbar("필수 항목을 확인해주세요.", "error");
      return false;
    }
    return true;
  };

  const carNumChk = (carNum) => {
    const v = carNum.trim();

    // 신형 => (예: 12가1234, 123나4567)
    const patternNew = /^\d{2,3}[가-힣]\d{4}$/;

    // 구형 => (예: 서울12가1234)
    const patternOld = /^[가-힣]{2,3}\d{2}[가-힣]\d{4}$/;

    return patternNew.test(v) || patternOld.test(v);
  };

  // if (loading) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       minHeight="400px"
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    <>
      <Header />
      <Box
        sx={{
          bgcolor: thisTheme.palette.background.default,
          minHeight: "100vh",
          py: isSmaller900 ? 3 : 6,
        }}
      >
        {loading && (
          <LoadingComponent open={loading} text="차량 정보를 불러오는 중..." />
        )}
        <CommonTitle>내 차량 관리</CommonTitle>
        <Grid container>
          <Grid size={isSmaller900 ? 1 : 2} />
          <Grid size={isSmaller900 ? 10 : 8}>
            {/* 추가 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog("create")}
                size={isSmaller900 ? "small" : "medium"}
                sx={{
                  bgcolor: C.blue,
                  minWidth: isSmaller900 ? 100 : 140,
                  height: isSmaller900 ? 35 : 50,
                }}
              >
                차량 추가
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* 리스트 */}
            <Box>
              {cars.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <DirectionsCar
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "text.secondary", mb: 1 }}
                  >
                    등록된 차량이 없습니다
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    새로운 차량을 등록해보세요
                  </Typography>
                </Box>
              ) : (
                cars.map((car) => (
                  <Paper
                    key={car.carId}
                    onClick={() => handleOpenDialog("edit", car)}
                    sx={{
                      p: 2.5,
                      mb: 2,
                      border: "0.8px solid",
                      borderColor: thisTheme.palette.text.secondary,
                      boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                      borderRadius: 1.5,
                      fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      bgcolor: thisTheme.palette.background.paper,
                      "&:hover": {
                        bgcolor: thisTheme.palette.background.default,
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        borderColor: thisTheme.palette.primary.main,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          flex: 8,
                        }}
                      >
                        {/* 상단: 차량번호와 상태 */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: C.blue,
                                width: 36,
                                height: 36,
                                fontSize: "1.2rem",
                                flexShrink: 0,
                              }}
                            >
                              <DirectionsCar />
                            </Avatar>
                            <Typography
                              variant={isSmaller900 ? "h6" : "h5"}
                              fontWeight="bold"
                              color={C.blue}
                            >
                              {car.carNum}
                            </Typography>
                          </Box>

                          {/* 우측 상단: 상태 */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            {getStatusChip(car.carStatus, isSmaller900)}
                          </Box>
                        </Box>

                        {/* 하단: 차량 정보 - 차량번호 밑에 왼쪽 정렬 */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            ml: 5, // 아이콘과 차량번호 영역만큼 왼쪽 여백 추가
                          }}
                        >
                          <Typography variant="body1" color="text.secondary" fontSize={FONT_SIZE}>
                            <strong>차종:</strong>{" "}
                            {car.vehicleType?.name || "-"}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontSize={FONT_SIZE}>
                            <strong>주행거리:</strong>{" "}
                            {car.mileage?.toLocaleString()}km
                          </Typography>
                          {car.inspection && (
                            <Typography variant="body1" color="text.secondary" fontSize={FONT_SIZE}>
                              <strong>점검일:</strong>{" "}
                              {dayjs(car.inspection).format("MM/DD")}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* 화살표 아이콘 */}
                      <ChevronRight
                        sx={{
                          color: thisTheme.palette.text.secondary,
                          fontSize: 32,
                        }}
                      />
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Grid>
          <Grid size={isSmaller900 ? 1 : 2} />
        </Grid>
      </Box>

      {/* 차량 등록/수정 Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <CommonSubTitle>
            {dialogMode === "create" ? "차량 등록" : "차량 수정"}
          </CommonSubTitle>
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
          >
            {/* 기본 정보 섹션 */}
            <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              기본 정보
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량 번호"
                  fullWidth
                  value={form.carNum}
                  onChange={(e) => handleFormChange("carNum", e.target.value)}
                  disabled={dialogMode === "edit"}
                  required
                  error={!!formErrors.carNum}
                  helperText={formErrors.carNum || " "}
                  FormHelperTextProps={helperProps}
                />
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량 등록일"
                  type="date"
                  fullWidth
                  value={form.regDate || ""}
                  onChange={(e) => handleFormChange("regDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  sx={
                    {
                      // "& .MuiInputBase-input.Mui-disabled": {
                      //   color: thisTheme.palette.text.primary,
                      //   WebkitTextFillColor: thisTheme.palette.text.primary,
                      // },
                    }
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <FormControl fullWidth required>
                  <InputLabel>차종</InputLabel>
                  <Select
                    value={form.vehicleTypeId}
                    disabled={dialogMode === "edit"}
                    onChange={(e) =>
                      handleFormChange("vehicleTypeId", e.target.value)
                    }
                    error={!!formErrors.vehicleTypeId}
                    required
                    label="차종"
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem
                        key={type.vehicleTypeId}
                        value={type.vehicleTypeId}
                      >
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formErrors.vehicleTypeId || " "}
                  </FormHelperText>
                </FormControl>
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <FormControl fullWidth required error={!!formErrors.carStatus}>
                  <InputLabel>차량 상태</InputLabel>
                  <Select
                    label="차량 상태"
                    value={form.carStatus}
                    onChange={(e) =>
                      handleFormChange("carStatus", e.target.value)
                    }
                  >
                    <MenuItem value="OPERATIONAL">운행 가능</MenuItem>
                    <MenuItem value="MAINTENANCE">정비중</MenuItem>
                  </Select>
                  <FormHelperText>{formErrors.carStatus || " "}</FormHelperText>
                </FormControl>
              </div>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="권장 다음 정비일"
                  type="date"
                  disabled
                  fullWidth
                  value={form.nextInspection || ""}
                  onChange={(e) =>
                    handleFormChange("nextInspection", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량마지막점검일"
                  type="date"
                  fullWidth
                  value={form.inspection}
                  onChange={(e) =>
                    handleFormChange("inspection", e.target.value)
                  }
                  required
                  error={!!formErrors.inspection}
                  helperText={formErrors.inspection || " "}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={helperProps}
                />
              </div>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="주행 거리"
                  fullWidth
                  value={form.mileage}
                  onChange={(e) => handleFormChange("mileage", e.target.value)}
                  required
                  error={!!formErrors.mileage}
                  helperText={formErrors.mileage || " "}
                  FormHelperTextProps={helperProps}
                  type="number"
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
                    step: 1,
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key))
                      e.preventDefault();
                  }}
                />
              </div>
              {/* <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량마지막점검일"
                  type="date"
                  fullWidth
                  value={form.inspection}
                  onChange={(e) =>
                    handleFormChange("inspection", e.target.value)
                  }
                  required
                  error={!!formErrors.inspection}
                  helperText={formErrors.inspection || " "}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={helperProps}
                />
              </div> */}
            </Box>

            {/* <Divider />

            선호시간대 섹션
            <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              선호시간대
            </Typography>
            <PreferredTimeBlock />

            <Divider /> */}

            {/* 운행선호지역 섹션 */}
            {/* <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              운행선호지역
            </Typography>
            <PreferredAreasSelect
              value={form.preferredAreas}
              onChange={(areas) => handleFormChange("preferredAreas", areas)}
              label="운행선호지역"
            /> */}

            <Divider />

            {/* 기타사항 */}
            <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              기타사항
            </Typography>
            <TextField
              label="기타사항"
              fullWidth
              value={form.etc}
              onChange={(e) => handleFormChange("etc", e.target.value)}
              multiline
              rows={3}
              helperText=" "
              FormHelperTextProps={helperProps}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
          <Button
            onClick={() => handleDeleteCar(form.carId)}
            variant="contained"
            sx={{
              bgcolor: thisTheme.palette.error.main,
              "&:hover": {
                bgcolor: lighten(thisTheme.palette.error.main, 0.1), // 호버 시 색상 변경
              },
            }}
          >
            삭제
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              취소
            </Button>
            <Button
              onClick={handleSaveCar}
              variant="contained"
              sx={{ bgcolor: C.blue }}
            >
              {dialogMode === "create" ? "등록" : "저장"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Footer />
    </>
  );
}
