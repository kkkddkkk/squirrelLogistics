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
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  DirectionsCar,
  CheckCircle,
  Warning,
  Error,
} from "@mui/icons-material";
import { carApi, vehicleTypeApi } from "../../api/cars";
import PreferredTimeBlock from "../../components/Time/PreferredTimeBlock";
import PreferredAreasSelect from "../../components/Area/PreferredAreasSelect";
import dayjs from "dayjs";

const C = { blue: "#113F67", gold: "#E8A93F" };

const helperProps = { sx: { minHeight: "20px" } }; // helperText 높이 고정

export default function ManageVehicles() {
  const [cars, setCars] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedCar, setSelectedCar] = useState(null);

  // Form 상태
  const [form, setForm] = useState({
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

  // 토큰 가져오기
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
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
    }
  };

  useEffect(() => {
    loadVehicleTypes();
    loadCars();
  }, []);

  // Dialog 열기
  const handleOpenDialog = (mode, car = null) => {
    setDialogMode(mode);
    setSelectedCar(car);

    if (mode === "edit" && car) {
      setForm({
        carNum: car.carNum || "",
        vehicleTypeId: car.vehicleType?.vehicleTypeId || "",

        mileage: car.mileage?.toString() || "",
        etc: car.etc || "",
        inspection: car.inspection
          ? dayjs(car.inspection).format("YYYY-MM-DD")
          : "",
        carStatus: car.carStatus || "OPERATIONAL",
        regDate: car.regDate ? dayjs(car.regDate).format("YYYY-MM-DD") : "",
        nextInspection: car.nextInspection
          ? dayjs(car.nextInspection).format("YYYY-MM-DD")
          : "",
        licenseNum: car.licenseNum || "",
        preferredStartTime: car.preferredStartTime || "",
        preferredEndTime: car.preferredEndTime || "",
        timeWindow: car.timeWindow || "07:00AM ~ 18:00PM",
        preferredAreas: car.preferredAreas || [],
        mainLoca: car.mainLoca || "서울",
      });
    } else {
      setForm({
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
    }

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
      const token = getToken();
      console.log("저장할 차량 데이터:", form);

      const carData = {
        ...form,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        inspection: form.inspection ? dayjs(form.inspection).toDate() : null,
        regDate: form.regDate ? dayjs(form.regDate).toDate() : null,
        nextInspection: form.nextInspection
          ? dayjs(form.nextInspection).toDate()
          : null,
      };

      console.log("변환된 차량 데이터:", carData);

      if (dialogMode === "create") {
        console.log("차량 생성 모드");
        await carApi.createCar(carData, token);
        alert("차량이 등록되었습니다.");
      } else {
        console.log("차량 수정 모드, carId:", selectedCar.carId);
        await carApi.updateCar(selectedCar.carId, carData, token);
        alert("차량이 수정되었습니다.");
      }

      handleCloseDialog();
      loadCars();
    } catch (err) {
      console.error("차량 저장 실패:", err);
      console.error("에러 상세:", err.response?.data);
      console.error("에러 상태:", err.response?.status);
      setError(err.response?.data?.message || "차량 저장에 실패했습니다.");
    }
  };

  // 차량 삭제
  const handleDeleteCar = async (carId) => {
    if (!window.confirm("정말로 이 차량을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = getToken();
      await carApi.deleteCar(carId, token);
      alert("차량이 삭제되었습니다.");
      loadCars();
    } catch (err) {
      console.error("차량 삭제 실패:", err);
      alert("차량 삭제에 실패했습니다.");
    }
  };

  // 차량 상태 표시
  const getStatusChip = (status) => {
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
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* 헤더 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ color: C.blue, fontWeight: 700, mb: 1 }}
          >
            내 차량 관리
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            등록된 차량 {cars.length}대
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog("create")}
          sx={{
            bgcolor: C.blue,
            "&:hover": { bgcolor: "#0d2f4f" },
            px: 3,
            py: 1.5,
            borderRadius: 2,
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

      {/* 차량 목록 */}
      {cars.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <DirectionsCar
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
            등록된 차량이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            새로운 차량을 등록해보세요
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog("create")}
            sx={{
              bgcolor: C.gold,
              "&:hover": { bgcolor: "#d69a2e" },
            }}
          >
            첫 번째 차량 등록
          </Button>
        </Paper>
      ) : (
        <Paper
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* 목록 헤더 */}
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid #e0e0e0",
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: C.blue }}>
              차량 목록
            </Typography>
          </Box>

          {/* 차량 목록 테이블 */}
          <Box sx={{ overflow: "auto" }}>
            {cars.map((car, index) => (
              <Box
                key={car.carId}
                sx={{
                  p: 3,
                  borderBottom:
                    index < cars.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "#f8f9fa",
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDialog("edit", car)}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* 왼쪽: 차량 정보 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flex: 1,
                    }}
                  >
                    {/* 차량 아이콘 */}
                    <Avatar
                      sx={{
                        bgcolor: C.blue,
                        width: 56,
                        height: 56,
                        fontSize: "1.5rem",
                      }}
                    >
                      <DirectionsCar />
                    </Avatar>

                    {/* 차량 기본 정보 */}
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: C.blue }}
                        >
                          {car.carNum}
                        </Typography>
                        {getStatusChip(car.carStatus)}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {car.vehicleType?.name} •{" "}
                        {car.mileage?.toLocaleString()}km
                      </Typography>
                    </Box>
                  </Box>

                  {/* 중앙: 추가 정보 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      mr: 3,
                    }}
                  >
                    {car.inspection && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        점검일: {dayjs(car.inspection).format("MM/DD")}
                      </Typography>
                    )}
                  </Box>

                  {/* 오른쪽: 삭제 버튼 */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCar(car.carId);
                      }}
                      sx={{
                        borderColor: "error.main",
                        color: "error.main",
                        "&:hover": {
                          borderColor: "error.main",
                          bgcolor: "error.50",
                        },
                      }}
                    >
                      차량 삭제
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {dialogMode === "create" ? "차량 등록" : "차량 수정"}
          </Typography>
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
                  label="차량번호"
                  fullWidth
                  value={form.carNum}
                  onChange={(e) => handleFormChange("carNum", e.target.value)}
                  disabled={dialogMode === "edit"}
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량등록일"
                  type="date"
                  fullWidth
                  value={form.regDate || ""}
                  onChange={(e) => handleFormChange("regDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: "#000000",
                      WebkitTextFillColor: "#000000",
                    },
                  }}
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <FormControl fullWidth>
                  <InputLabel>차종</InputLabel>
                  <Select
                    value={form.vehicleTypeId}
                    onChange={(e) =>
                      handleFormChange("vehicleTypeId", e.target.value)
                    }
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
                </FormControl>
              </div>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량 상태"
                  fullWidth
                  value={form.carStatus}
                  disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: "#000000",
                      WebkitTextFillColor: "#000000",
                    },
                  }}
                />
              </div>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="다음 정비 예정일"
                  type="date"
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
                  InputLabelProps={{ shrink: true }}
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>
            </Box>

            <Divider />

            {/* 선호시간대 섹션 */}
            <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              선호시간대
            </Typography>
            <PreferredTimeBlock />

            <Divider />

            {/* 운행선호지역 섹션 */}
            <Typography variant="h6" sx={{ color: C.blue, fontWeight: 600 }}>
              운행선호지역
            </Typography>
            <PreferredAreasSelect
              value={form.preferredAreas}
              onChange={(areas) => handleFormChange("preferredAreas", areas)}
              label="운행선호지역"
            />

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
        <DialogActions sx={{ p: 3, pt: 1 }}>
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
        </DialogActions>
      </Dialog>
    </Box>
  );
}
