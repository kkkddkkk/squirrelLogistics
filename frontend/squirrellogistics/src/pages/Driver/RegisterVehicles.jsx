import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Divider,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import NavBar from "../../components/driver/NavBar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const RegisterVehicle = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([
    {
      vehicleNumber: "",
      driverName: "",
      firstRegistrationDate: dayjs().format("YYYY.MM.DD"),
      vehicleType: "",
      loadCapacity: "",
      vehicleStatus: "운행 가능",
      currentDistance: "",
      lastInspectionDate: null,
      nextMaintenanceDate: null,
    },
  ]);

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAddVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        vehicleNumber: "",
        driverName: "",
        firstRegistrationDate: dayjs().format("YYYY.MM.DD"),
        vehicleType: "",
        loadCapacity: "",
        vehicleStatus: "운행 가능",
        currentDistance: "",
        lastInspectionDate: null,
        nextMaintenanceDate: null,
      },
    ]);
  };

  const handleDeleteVehicle = (index) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles);
  };

  const handleVehicleChange = (index, field, value) => {
    const newVehicles = [...vehicles];
    if (field === "currentDistance") {
      newVehicles[index][field] = formatNumberWithCommas(value);
    } else {
      newVehicles[index][field] = value;
    }
    setVehicles(newVehicles);
  };

  const handleRegisterAll = () => {
    console.log("Registered vehicles:", vehicles);
    alert("차량 정보가 등록되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #113F67 0%, #58A0C8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            차량 관리
          </Typography>

          <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
              새로운 차량 정보 입력
            </Typography>

            {vehicles.map((vehicle, index) => (
              <Box key={index} sx={{ mb: 4, position: "relative" }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  차량 {index + 1}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteVehicle(index)}
                  startIcon={<DeleteIcon />}
                  sx={{ position: "absolute", top: 10, right: 10 }}
                >
                  차량 삭제
                </Button>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="차량번호"
                      value={vehicle.vehicleNumber}
                      onChange={(e) =>
                        handleVehicleChange(
                          index,
                          "vehicleNumber",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="운전자 이름"
                      value={vehicle.driverName}
                      onChange={(e) =>
                        handleVehicleChange(index, "driverName", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="최초등록일자 (고정값)"
                      value={vehicle.firstRegistrationDate}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  {/* ✅ 차종 - Select */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>차종</InputLabel>
                      <Select
                        value={vehicle.vehicleType}
                        label="차종"
                        onChange={(e) =>
                          handleVehicleChange(
                            index,
                            "vehicleType",
                            e.target.value
                          )
                        }
                      >
                        {[
                          "일반 카고",
                          "윙바디",
                          "냉장/냉동",
                          "탑차",
                          "리프트",
                        ].map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* ✅ 최대 적재량 - Select */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>최대 적재량</InputLabel>
                      <Select
                        value={vehicle.loadCapacity}
                        label="최대 적재량"
                        onChange={(e) =>
                          handleVehicleChange(
                            index,
                            "loadCapacity",
                            e.target.value
                          )
                        }
                      >
                        {[
                          "1톤 미만",
                          "1~3톤",
                          "3~5톤",
                          "5~10톤",
                          "10~15톤",
                          "25톤 초과",
                        ].map((capacity) => (
                          <MenuItem key={capacity} value={capacity}>
                            {capacity}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="차량상태 (고정값)"
                      value={vehicle.vehicleStatus}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="현재 주행거리"
                      value={vehicle.currentDistance}
                      onChange={(e) =>
                        handleVehicleChange(
                          index,
                          "currentDistance",
                          e.target.value
                        )
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ ml: 1, color: "text.secondary" }}>
                              km
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="마지막 점검일"
                      value={vehicle.lastInspectionDate}
                      onChange={(newValue) =>
                        handleVehicleChange(
                          index,
                          "lastInspectionDate",
                          newValue
                        )
                      }
                      renderInput={(params) => (
                        <TextField fullWidth {...params} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="다음 정비 예정일"
                      value={vehicle.nextMaintenanceDate}
                      onChange={(newValue) =>
                        handleVehicleChange(
                          index,
                          "nextMaintenanceDate",
                          newValue
                        )
                      }
                      renderInput={(params) => (
                        <TextField fullWidth {...params} />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={handleAddVehicle}
                sx={{ px: 4, py: 2, fontSize: "1.1rem" }}
              >
                차량 추가하기
              </Button>
            </Box>
          </Paper>

          <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegisterAll}
              startIcon={<SaveIcon />}
              sx={{ px: 6, py: 2, fontSize: "1.2rem", fontWeight: "bold" }}
            >
              차량 전체 등록
            </Button>
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default RegisterVehicle;
