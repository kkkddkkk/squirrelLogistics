import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  Container,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getDriverCars,
  addCar,
  updateCar,
  deleteCar,
} from "../../api/driver/driverApi";

const ManageVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 차량 추가 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    id: "new",
    vehiclePlateNumber: "",
    vehicleType: "",
    firstRegistrationDate: dayjs().format("YYYY.MM.DD"),
    loadCapacity: "",
    currentDistance: "",
    vehicleStatus: "운행 가능",
    lastInspectionDate: null,
    nextMaintenanceDate: null,
    insuranceStatus: "무",
    insuranceStartDate: null,
    insuranceEndDate: null,
  });

  // 차량 목록 조회
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        const carsData = await getDriverCars();
        console.log("조회된 차량 데이터:", carsData);

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const formattedVehicles = carsData.map((car) => ({
          id: car.carId,
          vehicleNumber: car.carNum || "",
          vehiclePlateNumber: car.carNum || "",
          firstRegistrationDate: car.regDate
            ? dayjs(car.regDate).format("YYYY.MM.DD")
            : dayjs().format("YYYY.MM.DD"),
          vehicleType: car.vehicleType?.name || "",
          loadCapacity: car.vehicleType?.maxWeight
            ? `${car.vehicleType.maxWeight}kg`
            : "",
          vehicleStatus: car.carStatus || "운행 가능",
          currentDistance: car.Mileage
            ? `${car.Mileage.toLocaleString()} km`
            : "",
          lastInspectionDate: car.inspection ? dayjs(car.inspection) : null,
          nextMaintenanceDate: car.inspection ? dayjs(car.inspection) : null,
          operationStatus: car.carStatus || "운행중",
          insuranceStatus: car.insurance ? "유" : "무",
          insuranceStartDate: null,
          insuranceEndDate: null,
        }));

        setVehicles(formattedVehicles);
      } catch (error) {
        console.error("차량 목록 조회 실패:", error);
        setError("차량 정보를 불러오는데 실패했습니다.");

        // 에러 시 빈 배열로 설정
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // 숫자에 쉼표 추가
  const addCommasToNumber = (value) => {
    const numbersOnly = value.replace(/[^\d]/g, "");
    if (numbersOnly === "") return "";
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleChange = (vehicleId, name, value) => {
    let processedValue = value;
    if (name === "currentDistance") {
      processedValue = addCommasToNumber(value);
    }

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const updatedVehicle = { ...v, [name]: processedValue };

          // 보험유무가 "무"로 변경되면 보험 관련 날짜 필드 초기화
          if (name === "insuranceStatus" && processedValue === "무") {
            updatedVehicle.insuranceStartDate = null;
            updatedVehicle.insuranceEndDate = null;
          }

          return updatedVehicle;
        }
        return v;
      })
    );
  };

  const openAddForm = () => {
    setNewVehicle({
      carNum: "",
      vehicleTypeId: null,
      insurance: false,
      Mileage: "",
      etc: "",
      inspection: null,
      carStatus: "운행 가능",
    });
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
  };

  const handleNewVehicleChange = (field, value) => {
    setNewVehicle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addVehicle = async () => {
    try {
      // 필수 필드 검증
      if (!newVehicle.vehiclePlateNumber.trim()) {
        alert("차량번호를 입력해주세요.");
        return;
      }

      const carData = {
        carNum: newVehicle.vehiclePlateNumber,
        vehicleTypeId: null, // 차량 종류 ID는 별도로 관리 필요
        insurance: newVehicle.insuranceStatus === "유",
        Mileage: newVehicle.currentDistance
          ? parseInt(newVehicle.currentDistance.replace(/[^\d]/g, ""))
          : 0,
        etc: "",
        inspection: newVehicle.lastInspectionDate
          ? newVehicle.lastInspectionDate.toDate()
          : null,
        carStatus: "temporary", // CarStatusEnum에 temporary만 있음
      };

      const addedCar = await addCar(carData);
      console.log("추가된 차량:", addedCar);

      // 차량 목록 다시 조회
      const carsData = await getDriverCars();
      const formattedVehicles = carsData.map((car) => ({
        id: car.carId,
        vehicleNumber: car.carNum || "",
        vehiclePlateNumber: car.carNum || "",
        firstRegistrationDate: car.regDate
          ? dayjs(car.regDate).format("YYYY.MM.DD")
          : dayjs().format("YYYY.MM.DD"),
        vehicleType: car.vehicleType?.name || "",
        loadCapacity: car.vehicleType?.maxWeight
          ? `${car.vehicleType.maxWeight}kg`
          : "",
        vehicleStatus: car.carStatus || "운행 가능",
        currentDistance: car.Mileage
          ? `${car.Mileage.toLocaleString()} km`
          : "",
        lastInspectionDate: car.inspection ? dayjs(car.inspection) : null,
        nextMaintenanceDate: car.inspection ? dayjs(car.inspection) : null,
        operationStatus: car.carStatus || "운행중",
        insuranceStatus: car.insurance ? "유" : "무",
        insuranceStartDate: null,
        insuranceEndDate: null,
      }));

      setVehicles(formattedVehicles);
      closeAddForm();
      alert("차량이 성공적으로 추가되었습니다.");
      // 차량 추가 후 DriverProfile로 돌아가기
      navigate("/driver/profile", {
        state: { fromVehicleManagement: true },
      });
    } catch (error) {
      console.error("차량 추가 실패:", error);
      alert(
        "차량 추가에 실패했습니다: " + (error.response?.data || error.message)
      );
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (vehicles.length > 1) {
      try {
        await deleteCar(vehicleId);
        console.log("삭제된 차량 ID:", vehicleId);

        // 차량 목록에서 제거
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        alert("차량이 성공적으로 삭제되었습니다.");
        // 차량 삭제 후 DriverProfile로 돌아가기
        navigate("/driver/profile", {
          state: { fromVehicleManagement: true },
        });
      } catch (error) {
        console.error("차량 삭제 실패:", error);
        alert(
          "차량 삭제에 실패했습니다: " + (error.response?.data || error.message)
        );
      }
    }
  };

  const handleSave = async () => {
    try {
      // 각 차량 정보를 백엔드 형식으로 변환하여 저장
      for (const vehicle of vehicles) {
        const carData = {
          carNum: vehicle.vehiclePlateNumber,
          vehicleTypeId: null, // 차량 종류 ID는 별도로 관리 필요
          insurance: vehicle.insuranceStatus === "유",
          Mileage: vehicle.currentDistance
            ? parseInt(vehicle.currentDistance.replace(/[^\d]/g, ""))
            : 0,
          etc: "",
          inspection: vehicle.lastInspectionDate
            ? vehicle.lastInspectionDate.toDate()
            : null,
          carStatus: "temporary", // CarStatusEnum에 temporary만 있음
        };

        console.log("차량 수정 요청 데이터:", carData);
        await updateCar(vehicle.id, carData);
      }

      console.log("저장된 차량 정보:", vehicles);
      alert("차량 정보가 성공적으로 저장되었습니다.");
      navigate("/driver/profile", {
        state: { fromVehicleManagement: true },
      });
    } catch (error) {
      console.error("차량 정보 저장 실패:", error);
      alert(
        "차량 정보 저장에 실패했습니다: " +
          (error.response?.data || error.message)
      );
    }
  };

  const vehicleTypes = ["일반카고", "윙바디", "냉장/냉동", "탑차", "리프트"];
  const loadCapacities = [
    "1톤 미만",
    "1~3톤",
    "3~5톤",
    "5~10톤",
    "10~15톤",
    "25톤 초과",
  ];
  const vehicleStatuses = ["운행가능", "수리중", "운행불가"]; // 현재는 비활성 표시용
  const operationStatuses = ["운행중", "대기중", "정비중", "휴식중"];
  const insuranceStatuses = ["유", "무"];

  const getVehicleInfoFields = (vehicle) => {
    const baseFields = [
      ["차량번호", "vehiclePlateNumber", "차종", "vehicleType"],
      ["최초등록일자", "firstRegistrationDate", "최대 적재량", "loadCapacity"],
      ["현재 주행거리", "currentDistance", "차량상태", "vehicleStatus"],
      [
        "마지막 점검일",
        "lastInspectionDate",
        "다음 정비 예정일",
        "nextMaintenanceDate",
      ],
      ["보험유무", "insuranceStatus", "", ""],
    ];

    // 보험유무가 "유"인 경우에만 보험 관련 필드 추가
    if (vehicle.insuranceStatus === "유") {
      baseFields.push([
        "보험시작일",
        "insuranceStartDate",
        "보험만료일",
        "insuranceEndDate",
      ]);
    }

    return baseFields;
  };

  const renderField = (
    label,
    name,
    vehicle,
    isDate = false,
    isSelect = false,
    options = [],
    unit = "",
    disabled = false
  ) => {
    if (isDate) {
      return (
        <Box sx={{ width: "25%", height: "100%" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={vehicle[name]}
              onChange={(newValue) => handleChange(vehicle.id, name, newValue)}
              disabled={disabled}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    height: "100%",
                    "& .MuiOutlinedInput-root": {
                      height: "100%",
                      backgroundColor: disabled ? "#f5f5f5" : "white",
                      borderRadius: 0,
                      border: "none",
                      "& fieldset": {
                        borderColor: "transparent",
                        borderRadius: 0,
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                      },
                    },
                    "& input": {
                      padding: "16px 14px",
                      fontSize: "0.9rem",
                      color: "#333",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      );
    }

    if (isSelect) {
      return (
        <FormControl size="small" sx={{ width: "25%", height: "100%" }}>
          <Select
            value={vehicle[name] || ""}
            onChange={(e) => handleChange(vehicle.id, name, e.target.value)}
            disabled={disabled}
            displayEmpty
            sx={{
              height: "100%",
              backgroundColor: disabled ? "#f5f5f5" : "white",
              borderRadius: 0,
              border: "none",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
                borderRadius: 0,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                padding: "16px 14px",
                fontSize: "0.9rem",
                color: "#333",
              },
            }}
          >
            <MenuItem
              value=""
              disabled
              sx={{ color: "#999", fontSize: "0.9rem" }}
            >
              {name === "vehicleType"
                ? "차량 종류를 선택해주세요."
                : name === "loadCapacity"
                ? "최대 적재량을 선택해주세요."
                : name === "insuranceStatus"
                ? "보험 유무를 선택해주세요."
                : "선택해주세요."}
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option} value={option} sx={{ fontSize: "0.9rem" }}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        size="small"
        value={vehicle[name] || ""}
        onChange={(e) => handleChange(vehicle.id, name, e.target.value)}
        disabled={disabled}
        placeholder={unit}
        sx={{
          width: "25%",
          height: "100%",
          "& .MuiOutlinedInput-root": {
            height: "100%",
            backgroundColor: disabled ? "#f5f5f5" : "white",
            borderRadius: 0,
            border: "none",
            "& fieldset": {
              borderColor: "transparent",
              borderRadius: 0,
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
            },
            "& input": {
              textAlign: unit ? "right" : "left",
              padding: "16px 14px",
              fontSize: "0.9rem",
              color: "#333",
              display: "flex",
              alignItems: "center",
              minHeight: "100%",
            },
            "& .MuiInputBase-input": {
              color: disabled ? "#113F67" : "#333",
              fontWeight: disabled ? "bold" : "normal",
            },
            "& .MuiOutlinedInput-input": {
              color: disabled ? "#113F67" : "#333",
              fontWeight: disabled ? "bold" : "normal",
            },
          },
        }}
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#113F67"
          sx={{
            mb: 4,
            textAlign: "center",
            fontSize: { xs: "1.8rem", md: "2.2rem" },
          }}
        ></Typography>

        {/* 로딩 상태 */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 차량 목록 */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #e1e5e9",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#113F67",
                  mr: 2,
                }}
              />
              <Typography variant="h6" fontWeight="bold" color="#113F67">
                차량 목록
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#113F67",
                        borderBottom: "2px solid #e1e5e9",
                      }}
                    >
                      번호
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#113F67",
                        borderBottom: "2px solid #e1e5e9",
                      }}
                    >
                      차량번호
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#113F67",
                        borderBottom: "2px solid #e1e5e9",
                      }}
                    >
                      차량 상태
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.map((vehicle, index) => (
                    <TableRow
                      key={vehicle.id}
                      sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}
                    >
                      <TableCell sx={{ borderBottom: "1px solid #e1e5e9" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e1e5e9" }}>
                        {vehicle.vehiclePlateNumber || "-"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e1e5e9" }}>
                        {vehicle.vehicleStatus || "운행 가능"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* 차량 추가 버튼 */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={openAddForm}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#113F67",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(17, 63, 103, 0.3)",
              "&:hover": {
                backgroundColor: "#0d2d4a",
                boxShadow: "0 4px 12px rgba(17, 63, 103, 0.4)",
              },
            }}
          >
            차량 추가하기
          </Button>
        </Box>

        {/* 각 차량 정보 섹션 */}
        {vehicles.map((vehicle, vehicleIndex) => (
          <Paper
            key={vehicle.id}
            elevation={0}
            sx={{
              mb: 4,
              backgroundColor: "white",
              borderRadius: 2,
              border: "1px solid #e1e5e9",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 4,
                  pb: 2,
                  borderBottom: "2px solid #f1f3f4",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#113F67",
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold" color="#113F67">
                    자동차 기본 정보 {vehicleIndex + 1}
                  </Typography>
                </Box>
                {vehicles.length > 1 && (
                  <Button
                    onClick={() => deleteVehicle(vehicle.id)}
                    startIcon={<DeleteIcon />}
                    sx={{
                      color: "#d32f2f",
                      border: "1px solid #d32f2f",
                      borderRadius: 2,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                        borderColor: "#b71c1c",
                      },
                    }}
                    variant="outlined"
                    size="small"
                  >
                    삭제하기
                  </Button>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getVehicleInfoFields(vehicle).map(
                  ([label1, name1, label2, name2], idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        height: 60,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #e1e5e9",
                      }}
                    >
                      {/* 라벨 1 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          width: "25%",
                          height: "100%",
                          p: 2,
                          backgroundColor: "#f8fafc",
                          borderRight: "1px solid #e1e5e9",
                          minHeight: 60,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          color="#113F67"
                          fontSize="0.9rem"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            textAlign: "left",
                            lineHeight: 1,
                          }}
                        >
                          {label1}
                        </Typography>
                      </Box>

                      {/* 필드 1 */}
                      {name1 === "vehicleType"
                        ? renderField(
                            label1,
                            name1,
                            vehicle,
                            false,
                            true,
                            vehicleTypes
                          )
                        : name1 === "loadCapacity"
                        ? renderField(
                            label1,
                            name1,
                            vehicle,
                            false,
                            true,
                            loadCapacities
                          )
                        : name1 === "lastInspectionDate" ||
                          name1 === "nextMaintenanceDate"
                        ? renderField(label1, name1, vehicle, true)
                        : name1 === "currentDistance"
                        ? renderField(
                            label1,
                            name1,
                            vehicle,
                            false,
                            false,
                            [],
                            "km"
                          )
                        : name1 === "vehicleStatus"
                        ? renderField(
                            label1,
                            name1,
                            vehicle,
                            false,
                            false,
                            [],
                            "",
                            true
                          )
                        : name1 === "insuranceStatus"
                        ? renderField(
                            label1,
                            name1,
                            vehicle,
                            false,
                            true,
                            insuranceStatuses
                          )
                        : name1 === "insuranceStartDate" ||
                          name1 === "insuranceEndDate"
                        ? renderField(label1, name1, vehicle, true)
                        : renderField(label1, name1, vehicle)}

                      {/* 라벨 2 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          width: "25%",
                          height: "100%",
                          p: 2,
                          backgroundColor: "#f8fafc",
                          borderLeft: "1px solid #e1e5e9",
                          borderRight: "1px solid #e1e5e9",
                          minHeight: 60,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          color="#113F67"
                          fontSize="0.9rem"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            textAlign: "left",
                            lineHeight: 1,
                          }}
                        >
                          {label2}
                        </Typography>
                      </Box>

                      {/* 필드 2 */}
                      {name2 === "vehicleType"
                        ? renderField(
                            label2,
                            name2,
                            vehicle,
                            false,
                            true,
                            vehicleTypes
                          )
                        : name2 === "loadCapacity"
                        ? renderField(
                            label2,
                            name2,
                            vehicle,
                            false,
                            true,
                            loadCapacities
                          )
                        : name2 === "lastInspectionDate" ||
                          name2 === "nextMaintenanceDate"
                        ? renderField(label2, name2, vehicle, true)
                        : name2 === "vehicleStatus"
                        ? renderField(
                            label2,
                            name2,
                            vehicle,
                            false,
                            false,
                            [],
                            "",
                            true
                          )
                        : name2 === "insuranceStatus"
                        ? renderField(
                            label2,
                            name2,
                            vehicle,
                            false,
                            true,
                            insuranceStatuses
                          )
                        : name2 === "insuranceStartDate" ||
                          name2 === "insuranceEndDate"
                        ? renderField(label2, name2, vehicle, true)
                        : renderField(label2, name2, vehicle)}
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Paper>
        ))}

        {/* 차량 추가 폼 */}
        {showAddForm && (
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              backgroundColor: "white",
              borderRadius: 2,
              border: "1px solid #e1e5e9",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 4,
                  pb: 2,
                  borderBottom: "2px solid #f1f3f4",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: "#113F67",
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold" color="#113F67">
                    새 차량 추가
                  </Typography>
                </Box>
                <Button
                  onClick={closeAddForm}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: "#d32f2f",
                    border: "1px solid #d32f2f",
                    borderRadius: 2,
                    px: 2,
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                      borderColor: "#b71c1c",
                    },
                  }}
                >
                  취소
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getVehicleInfoFields(newVehicle).map(
                  ([label1, name1, label2, name2], idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        height: 60,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #e1e5e9",
                      }}
                    >
                      {/* 라벨 1 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          width: "25%",
                          height: "100%",
                          p: 2,
                          backgroundColor: "#f8fafc",
                          borderRight: "1px solid #e1e5e9",
                          minHeight: 60,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          color="#113F67"
                          fontSize="0.9rem"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            textAlign: "left",
                            lineHeight: 1,
                          }}
                        >
                          {label1}
                        </Typography>
                      </Box>

                      {/* 필드 1 */}
                      <Box sx={{ width: "25%", height: "100%" }}>
                        {name1 === "vehiclePlateNumber" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name1] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name1, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name1 === "vehicleType" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name1] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name1, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              <MenuItem value="">
                                차량 종류를 선택해주세요.
                              </MenuItem>
                              {vehicleTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name1 === "firstRegistrationDate" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name1] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name1, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name1 === "loadCapacity" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name1] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name1, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              <MenuItem value="">
                                최대 적재량을 선택해주세요.
                              </MenuItem>
                              {loadCapacities.map((capacity) => (
                                <MenuItem key={capacity} value={capacity}>
                                  {capacity}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name1 === "currentDistance" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name1] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name1, e.target.value)
                            }
                            InputProps={{
                              endAdornment: <span>km</span>,
                            }}
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name1 === "vehicleStatus" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name1] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name1, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name1 === "lastInspectionDate" ||
                          name1 === "nextMaintenanceDate" ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={newVehicle[name1]}
                              onChange={(newValue) =>
                                handleNewVehicleChange(name1, newValue)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    height: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      height: "100%",
                                      backgroundColor: "white",
                                      borderRadius: 0,
                                      border: "none",
                                      "& fieldset": {
                                        borderColor: "transparent",
                                        borderRadius: 0,
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "transparent",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "transparent",
                                      },
                                    },
                                    "& input": {
                                      padding: "16px 14px",
                                      fontSize: "0.9rem",
                                      color: "#333",
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        ) : name1 === "insuranceStatus" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name1] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name1, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              {insuranceStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name1 === "insuranceStartDate" ||
                          name1 === "insuranceEndDate" ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={newVehicle[name1]}
                              onChange={(newValue) =>
                                handleNewVehicleChange(name1, newValue)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    height: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      height: "100%",
                                      backgroundColor: "white",
                                      borderRadius: 0,
                                      border: "none",
                                      "& fieldset": {
                                        borderColor: "transparent",
                                        borderRadius: 0,
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "transparent",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "transparent",
                                      },
                                    },
                                    "& input": {
                                      padding: "16px 14px",
                                      fontSize: "0.9rem",
                                      color: "#333",
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        ) : (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name1] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name1, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        )}
                      </Box>

                      {/* 라벨 2 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          width: "25%",
                          height: "100%",
                          p: 2,
                          backgroundColor: "#f8fafc",
                          borderLeft: "1px solid #e1e5e9",
                          borderRight: "1px solid #e1e5e9",
                          minHeight: 60,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          color="#113F67"
                          fontSize="0.9rem"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            textAlign: "left",
                            lineHeight: 1,
                          }}
                        >
                          {label2}
                        </Typography>
                      </Box>

                      {/* 필드 2 */}
                      <Box sx={{ width: "25%", height: "100%" }}>
                        {name2 === "vehiclePlateNumber" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name2] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name2, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name2 === "vehicleType" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name2] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name2, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              <MenuItem value="">
                                차량 종류를 선택해주세요.
                              </MenuItem>
                              {vehicleTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name2 === "firstRegistrationDate" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name2] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name2, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name2 === "loadCapacity" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name2] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name2, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              <MenuItem value="">
                                최대 적재량을 선택해주세요.
                              </MenuItem>
                              {loadCapacities.map((capacity) => (
                                <MenuItem key={capacity} value={capacity}>
                                  {capacity}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name2 === "currentDistance" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name2] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name2, e.target.value)
                            }
                            InputProps={{
                              endAdornment: <span>km</span>,
                            }}
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name2 === "vehicleStatus" ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name2] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name2, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        ) : name2 === "lastInspectionDate" ||
                          name2 === "nextMaintenanceDate" ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={newVehicle[name2]}
                              onChange={(newValue) =>
                                handleNewVehicleChange(name2, newValue)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    height: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      height: "100%",
                                      backgroundColor: "white",
                                      borderRadius: 0,
                                      border: "none",
                                      "& fieldset": {
                                        borderColor: "transparent",
                                        borderRadius: 0,
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "transparent",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "transparent",
                                      },
                                    },
                                    "& input": {
                                      padding: "16px 14px",
                                      fontSize: "0.9rem",
                                      color: "#333",
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        ) : name2 === "insuranceStatus" ? (
                          <FormControl
                            size="small"
                            sx={{ width: "100%", height: "100%" }}
                          >
                            <Select
                              value={newVehicle[name2] || ""}
                              onChange={(e) =>
                                handleNewVehicleChange(name2, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "transparent",
                                  },
                              }}
                            >
                              {insuranceStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : name2 === "insuranceStartDate" ||
                          name2 === "insuranceEndDate" ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={newVehicle[name2]}
                              onChange={(newValue) =>
                                handleNewVehicleChange(name2, newValue)
                              }
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: {
                                    height: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      height: "100%",
                                      backgroundColor: "white",
                                      borderRadius: 0,
                                      border: "none",
                                      "& fieldset": {
                                        borderColor: "transparent",
                                        borderRadius: 0,
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "transparent",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "transparent",
                                      },
                                    },
                                    "& input": {
                                      padding: "16px 14px",
                                      fontSize: "0.9rem",
                                      color: "#333",
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        ) : (
                          <TextField
                            size="small"
                            fullWidth
                            value={newVehicle[name2] || ""}
                            onChange={(e) =>
                              handleNewVehicleChange(name2, e.target.value)
                            }
                            sx={{
                              height: "100%",
                              "& .MuiOutlinedInput-root": {
                                height: "100%",
                                backgroundColor: "white",
                                borderRadius: 0,
                                border: "none",
                                "& fieldset": {
                                  borderColor: "transparent",
                                  borderRadius: 0,
                                },
                                "&:hover fieldset": {
                                  borderColor: "transparent",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "transparent",
                                },
                              },
                              "& input": {
                                padding: "16px 14px",
                                fontSize: "0.9rem",
                                color: "#333",
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  onClick={addVehicle}
                  variant="contained"
                  sx={{
                    backgroundColor: "#113F67",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#0d2d4a",
                    },
                  }}
                >
                  차량 추가
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* 저장 버튼 */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#113F67",
              borderRadius: 2,
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(17, 63, 103, 0.3)",
              "&:hover": {
                backgroundColor: "#0d2d4a",
                boxShadow: "0 6px 16px rgba(17, 63, 103, 0.4)",
              },
            }}
          >
            저장하기
          </Button>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid #e1e5e9",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="#666" fontSize="0.85rem">
            별표(*)가 표시된 항목은 필수 입력 사항입니다.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ManageVehicles;
