import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { ReportProblemOutlined as ReportProblemOutlinedIcon } from "@mui/icons-material";

const EmergencyReportModal = ({ open, onClose, onReport }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!selectedCategory) {
      setError("신고 카테고리를 선택해주세요.");
      return;
    }
    if (!description.trim()) {
      setError("신고 내용을 입력해주세요.");
      return;
    }

    // 신고 데이터 구성
    const reportData = {
      category: selectedCategory,
      description: description.trim(),
      reporter: "DRIVER", // 운전자 신고
      rStatus: "PENDING", // 대기 상태
    };

    onReport(reportData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory("");
    setDescription("");
    setError("");
    onClose();
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "REVIEW":
        return "부적절한 리뷰";
      case "INAPPROPRIATE":
        return "부적절한 운송요청";
      case "EMERGENCY":
        return "긴급신고";
      case "ETC":
        return "차량 사고";
      default:
        return category;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ textAlign: "center", color: "#A20025", fontWeight: "bold" }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <ReportProblemOutlinedIcon sx={{ color: "#A20025" }} />
          <Typography variant="h6">긴급 신고</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          신고 카테고리를 선택하고 상세 내용을 입력해주세요.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: "bold" }}>
            신고 카테고리
          </FormLabel>
          <RadioGroup
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <FormControlLabel
              value="ETC"
              control={<Radio />}
              label="차량 사고"
            />
            <FormControlLabel
              value="INAPPROPRIATE"
              control={<Radio />}
              label="부적절한 운송요청"
            />
            <FormControlLabel
              value="REVIEW"
              control={<Radio />}
              label="부적절한 리뷰"
            />
            <FormControlLabel
              value="EMERGENCY"
              control={<Radio />}
              label="긴급신고"
            />
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="신고 내용"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="신고 내용을 자세히 입력해주세요..."
          variant="outlined"
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ mr: 2, px: 3 }}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#A20025",
            color: "white",
            px: 3,
            "&:hover": {
              bgcolor: "#8B001F",
            },
          }}
          startIcon={<ReportProblemOutlinedIcon />}
        >
          신고하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyReportModal;
