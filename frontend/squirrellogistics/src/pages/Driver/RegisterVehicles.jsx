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

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환하는 헬퍼 함수
const getFormattedDate = () => new Date().toISOString().split("T")[0];

const createEmptyVehicle = () => {
  return {
    registrationDate: getFormattedDate(),
    vehicleNumber: "",
    vehicleType: "",
    loadCapacity: "",
    vehicleStatus: "운행 가능",
    insuranceStatus: "유",
    currentDistance: "",
    lastInspection: "",
    nextInspection: "",
  };
};

const RegisterVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([createEmptyVehicle()]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setVehicles((prev) =>
      prev.map((vehicle, i) =>
        i === index ? { ...vehicle, [name]: value } : vehicle
      )
    );
  };

  const addVehicle = () => {
    setVehicles((prev) => [...prev, createEmptyVehicle()]);
  };

  const removeVehicle = (index) => {
    if (vehicles.length === 1) return;
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("등록된 차량:", vehicles);
    alert("차량 등록이 완료되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #113F67 0%, #58A0C8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          차량 최초 등록
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Stack spacing={4}>
            {vehicles.map((vehicle, index) => (
              <Card
                key={`vehicle-${index}`} // 고유한 키 사용
                variant="outlined"
                sx={{
                  position: "relative",
                  bgcolor: "background.paper",
                  border: "2px solid",
                  borderColor: "grey.200",
                  "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: "0 4px 12px rgba(17, 63, 103, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: "secondary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "secondary.contrastText",
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Box>
                      차량 {index + 1}
                    </Typography>
                    {vehicles.length > 1 && (
                      <IconButton
                        onClick={() => removeVehicle(index)}
                        color="error"
                        size="large"
                        sx={{
                          bgcolor: "error.light",
                          color: "white",
                          "&:hover": {
                            bgcolor: "error.main",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="차량 등록일"
                        name="registrationDate"
                        value={vehicle.registrationDate}
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          sx: { bgcolor: "grey.50" },
                        }}
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
                        placeholder="예: 12가 3456"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>차량 종류</InputLabel>
                        <Select
                          name="vehicleType"
                          value={vehicle.vehicleType}
                          label="차량 종류"
                          onChange={(e) => handleChange(index, e)}
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
                          ].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
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
                          label="최대 적재량"
                          onChange={(e) => handleChange(index, e)}
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
                          ].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
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
                        InputProps={{
                          readOnly: true,
                          sx: {
                            bgcolor: "success.light",
                            color: "success.contrastText",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>보험 여부</InputLabel>
                        <Select
                          name="insuranceStatus"
                          value={vehicle.insuranceStatus}
                          label="보험 여부"
                          onChange={(e) => handleChange(index, e)}
                        >
                          <MenuItem value="">
                            <em>선택</em>
                          </MenuItem>
                          {["유", "무"].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
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
                        placeholder="예: 50000"
                        type="number"
                        InputProps={{ endAdornment: <span>km</span> }}
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
              sx={{
                py: 3,
                borderColor: "secondary.main",
                color: "secondary.main",
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  borderColor: "secondary.main",
                },
              }}
            >
              + 차량 추가하기
            </Button>
            <Box display="flex" justifyContent="space-between" pt={4} gap={3}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/driver/profile")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  borderColor: "grey.400",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "grey.600",
                    bgcolor: "grey.50",
                  },
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
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
