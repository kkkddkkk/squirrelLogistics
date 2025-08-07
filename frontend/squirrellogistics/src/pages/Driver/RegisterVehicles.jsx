// RegisterVehicles.jsx (MUI 기반 스타일 수정: 지정 색상 팔레트 반영)

import React, { useState } from "react";
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
  Card,
  CardContent,
  IconButton,
  Stack,
  Grid,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const getFormattedDate = () => new Date().toISOString().split("T")[0];

const createEmptyVehicle = () => ({
  registrationDate: getFormattedDate(),
  vehicleNumber: "",
  vehicleType: "",
  loadCapacity: "",
  vehicleStatus: "운행 가능",
  insuranceStatus: "유",
  currentDistance: "",
  lastInspection: "",
  nextInspection: "",
});

const RegisterVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([createEmptyVehicle()]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [name]: value } : v))
    );
  };

  const addVehicle = () =>
    setVehicles((prev) => [...prev, createEmptyVehicle()]);
  const removeVehicle = (index) => {
    if (vehicles.length === 1) return;
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("차량 등록이 완료되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4, color: "#113F67" }}
        >
          차량 등록하기
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {vehicles.map((vehicle, index) => (
              <Card
                key={index}
                sx={{ border: "1px solid #E0E6ED", bgcolor: "#ffffff" }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#113F67" }}
                    >
                      차량 {index + 1}
                    </Typography>
                    {vehicles.length > 1 && (
                      <IconButton
                        onClick={() => removeVehicle(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="차량 등록일"
                        name="registrationDate"
                        value={vehicle.registrationDate}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="차량 번호"
                        name="vehicleNumber"
                        value={vehicle.vehicleNumber}
                        onChange={(e) => handleChange(index, e)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>차량 종류</InputLabel>
                        <Select
                          name="vehicleType"
                          value={vehicle.vehicleType}
                          onChange={(e) => handleChange(index, e)}
                          label="차량 종류"
                        >
                          <MenuItem value="">
                            <em>선택</em>
                          </MenuItem>
                          {[
                            "일반 카고",
                            "윙바디",
                            "냉장/냉동",
                            "탑차",
                            "리프트",
                          ].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>최대 적재량</InputLabel>
                        <Select
                          name="loadCapacity"
                          value={vehicle.loadCapacity}
                          onChange={(e) => handleChange(index, e)}
                          label="최대 적재량"
                        >
                          <MenuItem value="">
                            <em>선택</em>
                          </MenuItem>
                          {[
                            "~1톤",
                            "1~3톤",
                            "3~5톤",
                            "5~10톤",
                            "10~15톤",
                            "20~25톤",
                          ].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="차량 상태"
                        name="vehicleStatus"
                        value={vehicle.vehicleStatus}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>보험 여부</InputLabel>
                        <Select
                          name="insuranceStatus"
                          value={vehicle.insuranceStatus}
                          onChange={(e) => handleChange(index, e)}
                          label="보험 여부"
                        >
                          <MenuItem value="">
                            <em>선택</em>
                          </MenuItem>
                          {["유", "무"].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="현재 주행거리"
                        name="currentDistance"
                        value={vehicle.currentDistance}
                        onChange={(e) => handleChange(index, e)}
                        fullWidth
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="마지막 점검일"
                        name="lastInspection"
                        type="date"
                        value={vehicle.lastInspection}
                        onChange={(e) => handleChange(index, e)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="다음 정비 예정일"
                        name="nextInspection"
                        type="date"
                        value={vehicle.nextInspection}
                        onChange={(e) => handleChange(index, e)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addVehicle}
              fullWidth
              sx={{ borderColor: "#E8A93F", color: "#E8A93F", fontWeight: 600 }}
            >
              차량 추가하기
            </Button>

            <Box display="flex" justifyContent="space-between" pt={4} gap={3}>
              <Button
                variant="outlined"
                onClick={() => navigate("/driver/profile")}
                sx={{ color: "#2A2A2A", borderColor: "#E0E6ED" }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "#113F67",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#0d2f4d" },
                }}
              >
                전체 차량 등록
              </Button>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterVehicles;
