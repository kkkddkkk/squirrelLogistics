import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  IconButton,
  Chip,
} from "@mui/material";
import {
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const CATEGORY_OPTIONS = ["ETC", "INAPPROPRIATE", "REVIEW", "EMERGENCY"];



const EmergencyReportModal = ({
  open,
  assignId = null,
  driverId = null,
  onClose,
  presetCategory = 'ETC',
  lockCategory = true,
  onReport }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  //카테고리 enum과 유저 출력용 스트링 매핑.
  const labelOf = useCallback((category) => {
    switch (category) {
      case "REVIEW": return "부적절한 리뷰";
      case "INAPPROPRIATE": return "부적절한 운송요청";
      case "EMERGENCY": return "긴급신고";
      case "ETC": default: return "차량 사고";
    }
  }, []);

  const buildTitle = useCallback((driverIdArg, category) => {
    return `[${labelOf(category)}] 유저 아이디: ${driverIdArg ?? '미확인'}번`;
  }, [labelOf]);

  const buildAutoContent = useCallback((driverIdArg, category) => {
    if (category === "EMERGENCY") {
      return `${driverIdArg ?? '미확인'}번 아이디 유저에 의한 긴급 신고 접수, 빠른 확인을 요망합니다.`;
    }
    return "";
  }, []);


  //위에서 지정한 카테고리로 강제 세팅.
  useEffect(() => {
    if (open) {
      const safe = CATEGORY_OPTIONS.includes(presetCategory) ? presetCategory : "ETC";
      setSelectedCategory(safe);
      setError("");
    }
  }, [open, presetCategory]);

  useEffect(() => {
    if (!open) return;
    const effectiveCat = lockCategory ? (CATEGORY_OPTIONS.includes(presetCategory) ? presetCategory : "ETC")
      : selectedCategory;

    if (effectiveCat === "EMERGENCY" && !description.trim()) {
      setDescription(buildAutoContent(driverId, "EMERGENCY"));
    }
  }, [open, lockCategory, presetCategory, selectedCategory, description, driverId, buildAutoContent]);

  //고정 모드면 fixed, 아니면 선택 가능하게 풀기.
  const visibleOptions = useMemo(() => {
    if (!lockCategory) return CATEGORY_OPTIONS;
    return [selectedCategory || presetCategory];
  }, [lockCategory, selectedCategory, presetCategory]);

  const handleSubmit = () => {
    if (!selectedCategory) {
      setError("신고 카테고리를 선택해주세요.");
      return;
    }

    //EMERGENCY=>  내용 자동 생성
    let finalContent = description.trim();
    if (lockCategory && selectedCategory === "EMERGENCY" && !finalContent) {
      finalContent = buildAutoContent(driverId, selectedCategory);
    }

    //다른 카테고리는 내용 필수
    if (!finalContent && selectedCategory !== "EMERGENCY") {
      setError("신고 내용을 입력해주세요.");
      return;
    }
    const reportData = {
      assignedId: assignId,
      rCate: selectedCategory,
      rTitle: buildTitle(driverId, selectedCategory),
      rContent: finalContent,
      reporter: "DRIVER",
      rStatus: "PENDING",
    };

    onReport?.(reportData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "#A20025",
          fontWeight: "bold",
          position: "relative",
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <ReportProblemOutlinedIcon sx={{ color: "#A20025" }} />
          <Typography variant="h6">신고</Typography>
        </Box>

        {/* 우측 상단 X 버튼 */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#666",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>


        {!lockCategory ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            신고 카테고리를 선택하고 상세 내용을 입력해주세요.
          </Typography>
        ) : (null)}


        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          {lockCategory ? (
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>신고 카테고리</FormLabel>
              <Chip label={labelOf(selectedCategory)} color="error" variant="outlined" />
            </Box>
          ) : (
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: "bold" }}>신고 카테고리</FormLabel>
              <RadioGroup
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt}
                    value={opt}
                    control={<Radio />}
                    label={labelOf(opt)}
                    disabled={lockCategory && opt !== selectedCategory}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#A20025",
            color: "white",
            px: 4,
            py: 1.2,
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#8B001F",
            },
          }}
        >
          신고하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyReportModal;
