import React, { useState, useEffect } from "react";
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
  Chip,
  Grid,
  Stack,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EditVehicles = () => {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState({
    registrationDate: "",
    vehicleNumber: "",
    vehicleTypes: [],
    selectedType: "",
    loadCapacities: {},
    vehicleStatus: "운행 가능",
    insuranceStatus: "유",
    currentDistance: "",
    lastInspection: "",
    nextInspection: "",
  });
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setVehicle((prev) => ({ ...prev, registrationDate: today }));
  }, []);

  useEffect(() => {
    if (vehicle.lastInspection) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const lastDate = new Date(vehicle.lastInspection);
      setWarning(lastDate < oneYearAgo ? "차량 점검일을 확인하세요." : "");
    }
  }, [vehicle.lastInspection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (e) => {
    const selected = e.target.value;
    if (!vehicle.vehicleTypes.includes(selected)) {
      setVehicle((prev) => ({
        ...prev,
        vehicleTypes: [...prev.vehicleTypes, selected],
        loadCapacities: { ...prev.loadCapacities, [selected]: "" },
      }));
    }
  };

  const handleTypeRemove = (type) => {
    const updatedTypes = vehicle.vehicleTypes.filter((t) => t !== type);
    const updatedCapacities = { ...vehicle.loadCapacities };
    delete updatedCapacities[type];
    setVehicle((prev) => ({
      ...prev,
      vehicleTypes: updatedTypes,
      loadCapacities: updatedCapacities,
    }));
  };

  const handleCapacityChange = (type, value) => {
    setVehicle((prev) => ({
      ...prev,
      loadCapacities: { ...prev.loadCapacities, [type]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("차량 정보가 수정되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <Box>
      <NavBar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          운송 차량 정보 수정
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="차량 등록일"
              name="registrationDate"
              value={vehicle.registrationDate}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="차량 번호"
              name="vehicleNumber"
              value={vehicle.vehicleNumber}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>차량 종류</InputLabel>
              <Select
                value={vehicle.selectedType}
                label="차량 종류"
                name="selectedType"
                onChange={handleTypeSelect}
              >
                {["일반 카고", "윙바디", "냉장/냉동", "탑차", "리프트"].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            {/* 선택된 차량 종류 및 적재량 */}
            {vehicle.vehicleTypes.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {vehicle.vehicleTypes.map((type) => (
                  <Chip
                    key={type}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{type}</span>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={vehicle.loadCapacities[type] || ""}
                            onChange={(e) =>
                              handleCapacityChange(type, e.target.value)
                            }
                            displayEmpty
                          >
                            <MenuItem value="">적재량</MenuItem>
                            {[
                              "~1톤",
                              "1~3톤",
                              "3~5톤",
                              "5~10톤",
                              "10~15톤",
                              "20~25톤",
                            ].map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton
                          size="small"
                          onClick={() => handleTypeRemove(type)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{ p: 1, borderRadius: 2, bgcolor: "grey.100" }}
                  />
                ))}
              </Box>
            )}
            <TextField
              label="차량 상태"
              name="vehicleStatus"
              value={vehicle.vehicleStatus}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>보험 여부</InputLabel>
              <Select
                value={vehicle.insuranceStatus}
                label="보험 여부"
                name="insuranceStatus"
                onChange={handleChange}
              >
                {["유", "무"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="현재 주행거리"
              name="currentDistance"
              value={vehicle.currentDistance}
              onChange={handleChange}
              fullWidth
              InputProps={{ endAdornment: <span>km</span> }}
            />
            <TextField
              label="마지막 점검일"
              name="lastInspection"
              type="date"
              value={vehicle.lastInspection}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {warning && (
              <Typography color="error" variant="body2">
                {warning}
              </Typography>
            )}
            <TextField
              label="다음 정비 예정일"
              name="nextInspection"
              type="date"
              value={vehicle.nextInspection}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
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

export default EditVehicles;
