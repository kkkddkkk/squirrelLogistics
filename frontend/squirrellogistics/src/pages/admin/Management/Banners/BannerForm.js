// src/pages/admin/Management/Banners/BannerForm.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  FormHelperText,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { createBanner, updateBanner, getBannerWithFallback } from '../../../../api/banner';

const PALETTE = {
  blue: "#113F67",
  gold: "#E8A93F",
  grayBg: "#F5F7FA",
  text: "#2A2A2A",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
};

const POSITIONS = [
  { label: "홈 상단", value: "홈 상단", description: "메인 페이지 최상단에 표시" },
  { label: "홈 중단", value: "홈 중단", description: "메인 페이지 중간 영역에 표시" },
  { label: "홈 하단", value: "홈 하단", description: "메인 페이지 하단에 표시" },
];

const STATUS = [
  { label: "노출", value: "ACTIVE", description: "사용자에게 배너가 보입니다" },
  { label: "비노출", value: "INACTIVE", description: "사용자에게 배너가 보이지 않습니다" },
];

const IMAGE_DIMENSIONS = {
  "홈 상단": { width: 1200, height: 300, ratio: "4:1" },
  "홈 중단": { width: 800, height: 200, ratio: "4:1" },
  "홈 하단": { width: 600, height: 150, ratio: "4:1" },
};

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = Boolean(id);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    position: "홈 상단",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    status: "ACTIVE",
    order: 1,
    linkUrl: "",
    imageUrl: "",
    memo: "",
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imageFile, setImageFile] = useState(null);
  const [existingBanners, setExistingBanners] = useState([]);
  const [orderConflict, setOrderConflict] = useState(false);

  // 기존 배너 목록 로드
  const loadExistingBanners = useCallback(async () => {
    try {
      const result = await fetchBannersWithFallback();
      const banners = result.data || result;
      // 현재 편집 중인 배너는 제외
      const filteredBanners = isEdit ? banners.filter(b => b.id !== id) : banners;
      setExistingBanners(filteredBanners);
    } catch (error) {
      console.error("기존 배너 목록 로드 실패:", error);
    }
  }, [id, isEdit]);

  useEffect(() => {
    loadExistingBanners();
  }, [loadExistingBanners]);

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const data = await getBanner(id);
        if (data) {
          setForm({
            title: data.title || "",
            position: data.position || "홈 상단",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            status: data.status || "ACTIVE",
            order: data.order ?? 1,
            linkUrl: data.linkUrl || "",
            imageUrl: data.imageUrl || "",
            memo: data.memo || "",
          });
          setPreview(data.imageUrl || "");
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // 순서 중복 확인
  useEffect(() => {
    if (form.position && form.order) {
      const conflict = existingBanners.some(banner => 
        banner.position === form.position && banner.order === form.order
      );
      setOrderConflict(conflict);
    } else {
      setOrderConflict(false);
    }
  }, [form.position, form.order, existingBanners]);

  // 사용 가능한 순서 옵션 생성
  const getAvailableOrders = () => {
    const positionBanners = existingBanners.filter(b => b.position === form.position);
    const usedOrders = positionBanners.map(b => b.order).sort((a, b) => a - b);
    
    // 1부터 시작하여 사용되지 않은 순서 찾기
    const availableOrders = [];
    let currentOrder = 1;
    
    for (let i = 0; i < usedOrders.length; i++) {
      if (currentOrder < usedOrders[i]) {
        availableOrders.push(currentOrder);
      }
      currentOrder = usedOrders[i] + 1;
    }
    
    // 마지막 순서 이후도 추가
    if (usedOrders.length > 0) {
      availableOrders.push(usedOrders[usedOrders.length - 1] + 1);
    } else {
      availableOrders.push(1);
    }
    
    return availableOrders;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "제목을 입력해 주세요.";
    } else if (form.title.length > 100) {
      newErrors.title = "제목은 100자 이하여야 합니다.";
    }

    if (!form.imageUrl) {
      newErrors.imageUrl = "이미지를 업로드해 주세요.";
    }

    if (!form.startDate) {
      newErrors.startDate = "시작일을 입력해 주세요.";
    }

    if (!form.endDate) {
      newErrors.endDate = "종료일을 입력해 주세요.";
    }

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = "종료일은 시작일 이후여야 합니다.";
    }

    if (form.linkUrl && !isValidUrl(form.linkUrl)) {
      newErrors.linkUrl = "올바른 URL 형식을 입력해 주세요.";
    }

    if (form.order < 1) {
      newErrors.order = "순서는 1 이상이어야 합니다.";
    }

    if (orderConflict) {
      newErrors.order = "해당 위치에서 이미 사용 중인 순서입니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // 위치 변경 시 순서 자동 조정
    if (name === "position") {
      const availableOrders = getAvailableOrders();
      if (availableOrders.length > 0) {
        setForm(f => ({ ...f, position: value, order: availableOrders[0] }));
      }
      showSnackbar("위치가 변경되었습니다. 이미지 비율을 확인해 주세요.", "warning");
    }

    // 순서 변경 시 중복 확인
    if (name === "order") {
      const numValue = parseInt(value) || 0;
      setForm(f => ({ ...f, order: numValue }));
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith("image/")) {
      showSnackbar("이미지 파일만 업로드 가능합니다.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      showSnackbar("파일 크기는 5MB 이하여야 합니다.", "error");
      return;
    }

    setImageFile(file);
    
    // 미리보기 생성
    const url = URL.createObjectURL(file);
    setPreview(url);
    setForm((f) => ({ ...f, imageUrl: url }));
    
    // 에러 메시지 제거
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: "" }));
    }

    showSnackbar("이미지가 업로드되었습니다.");
  };

  const removeImage = () => {
    setPreview("");
    setForm(f => ({ ...f, imageUrl: "" }));
    setImageFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar("입력 정보를 확인해 주세요.", "error");
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        await updateBanner(id, form);
        showSnackbar("배너가 수정되었습니다.");
      } else {
        await createBanner(form);
        showSnackbar("배너가 등록되었습니다.");
      }
      
      navigate("/admin/management/banners");
    } catch (error) {
      showSnackbar(isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getImageDimensions = () => {
    return IMAGE_DIMENSIONS[form.position] || IMAGE_DIMENSIONS["홈 상단"];
  };

  const currentDimensions = getImageDimensions();
  const availableOrders = getAvailableOrders();

  if (loading && isEdit) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ color: PALETTE.blue, fontWeight: 700, mb: 3 }}>
        {isEdit ? "배너 수정" : "배너 등록"}
      </Typography>

      <Paper component="form" onSubmit={onSubmit} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={4}>
          {/* 기본 정보 */}
          <Box>
            <Typography variant="h6" sx={{ color: PALETTE.blue, mb: 3, display: "flex", alignItems: "center" }}>
              <InfoIcon sx={{ mr: 1.5 }} />
              기본 정보
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="제목 *"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title || "배너의 제목을 입력하세요 (최대 100자)"}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="위치 *"
                  name="position"
                  value={form.position}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.position}
                  helperText={errors.position}
                >
                  {POSITIONS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      <Stack>
                        <Typography variant="body2">{p.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="상태 *"
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.status}
                  helperText={errors.status}
                >
                  {STATUS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      <Stack>
                        <Typography variant="body2">{s.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 기간 및 순서 */}
          <Box>
            <Typography variant="h6" sx={{ color: PALETTE.blue, mb: 3, display: "flex", alignItems: "center" }}>
              <CalendarIcon sx={{ mr: 1.5 }} />
              노출 기간 및 순서
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="시작일 *"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={onChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!errors.startDate}
                  helperText={errors.startDate || "배너 노출 시작일"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="종료일 *"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={onChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={!!errors.endDate}
                  helperText={errors.endDate || "배너 노출 종료일"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="노출 순서 *"
                  name="order"
                  value={form.order}
                  onChange={onChange}
                  fullWidth
                  error={!!errors.order || orderConflict}
                  helperText={
                    errors.order || 
                    (orderConflict ? "이미 사용 중인 순서입니다" : "숫자가 작을수록 먼저 표시됩니다")
                  }
                >
                  {availableOrders.map((order) => (
                    <MenuItem key={order} value={order}>
                      {order}번째
                    </MenuItem>
                  ))}
                </TextField>
                {orderConflict && (
                  <FormHelperText error sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                    <WarningIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    해당 위치에서 이미 사용 중인 순서입니다. 다른 순서를 선택해 주세요.
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 링크 URL */}
          <Box>
            <Typography variant="h6" sx={{ color: PALETTE.blue, mb: 3, display: "flex", alignItems: "center" }}>
              <LinkIcon sx={{ mr: 1.5 }} />
              링크 설정
            </Typography>
            <TextField
              label="링크 URL"
              name="linkUrl"
              value={form.linkUrl}
              onChange={onChange}
              fullWidth
              error={!!errors.linkUrl}
              helperText={errors.linkUrl || "배너 클릭 시 이동할 주소 (선택사항)"}
              placeholder="https://example.com"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 이미지 업로드 */}
          <Box>
            <Typography variant="h6" sx={{ color: PALETTE.blue, mb: 3, display: "flex", alignItems: "center" }}>
              <UploadIcon sx={{ mr: 1.5 }} />
              이미지 업로드
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                권장 이미지 크기: {currentDimensions.width} × {currentDimensions.height}px ({currentDimensions.ratio} 비율)
              </Typography>
            </Alert>

            <Grid container spacing={3} alignItems="flex-start">
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => fileRef.current?.click()}
                    startIcon={<UploadIcon />}
                    sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
                    fullWidth
                  >
                    이미지 선택
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onFile}
                  />
                  {preview && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={removeImage}
                      startIcon={<DeleteIcon />}
                      fullWidth
                    >
                      이미지 제거
                    </Button>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={8}>
                {preview ? (
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      image={preview}
                      alt="배너 미리보기"
                      sx={{
                        height: 200,
                        objectFit: "contain",
                        backgroundColor: PALETTE.grayBg,
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        미리보기 (실제 크기와 다를 수 있습니다)
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      border: `2px dashed ${PALETTE.grayBg}`,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: PALETTE.grayBg + "20",
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <UploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        이미지를 선택하거나 드래그하여 업로드하세요
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Grid>
            </Grid>
            
            {errors.imageUrl && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.imageUrl}
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 메모 */}
          <Box>
            <Typography variant="h6" sx={{ color: PALETTE.blue, mb: 3 }}>
              메모
            </Typography>
            <TextField
              label="내부 참고용 메모"
              name="memo"
              value={form.memo}
              onChange={onChange}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              placeholder="배너 관리자만 볼 수 있는 메모를 입력하세요"
              helperText="최대 500자까지 입력 가능합니다"
              inputProps={{ maxLength: 500 }}
            />
          </Box>

          {/* 액션 버튼 */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/management/banners")}
              startIcon={<CancelIcon />}
              sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ backgroundColor: PALETTE.blue }}
              disabled={loading || orderConflict}
              fullWidth={isMobile}
            >
              {loading ? "처리 중..." : (isEdit ? "수정" : "등록")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
