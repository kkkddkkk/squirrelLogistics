import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Rating,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getReviewById, updateReview, deleteReview } from "./reviewApi";

const ReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 리뷰 데이터 로드
  useEffect(() => {
    if (id) {
      loadReview();
    }
  }, [id]);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("리뷰 상세 데이터 로드 시작 (ID):", id);
      const data = await getReviewById(id);
      console.log("로드된 리뷰 데이터:", data);
      
      if (data && !data.error) {
        setReview(data);
        setEditData({
          rating: data.rating || 0,
          reason: data.reason || data.content || "",
          stateEnum: data.stateEnum || data.status || "PENDING",
        });
      } else {
        setError(data?.error || "리뷰를 찾을 수 없습니다.");
      }
    } catch (e) {
      console.error("리뷰 데이터 로드 실패:", e);
      setError("리뷰 상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      rating: review.rating || 0,
      reason: review.reason || "",
      stateEnum: review.stateEnum || "PENDING",
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      
      await updateReview(id, editData);
      setSuccess("리뷰가 성공적으로 수정되었습니다.");
      setIsEditing(false);
      
      // 목록 페이지로 이동
      setTimeout(() => {
        navigate("/admin/review/list");
      }, 2000);
      
    } catch (e) {
      console.error("리뷰 수정 실패:", e);
      setError("리뷰 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteReview(id);
      setSuccess("리뷰가 성공적으로 삭제되었습니다.");
      setDeleteDialogOpen(false);
      
      setTimeout(() => {
        navigate("/admin/review/list");
      }, 2000);
      
    } catch (e) {
      console.error("리뷰 삭제 실패:", e);
      setError("리뷰 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 상태별 칩 렌더링
  const renderStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="등록 대기" color="warning" size="medium" icon={<WarningIcon />} />;
      case 'APPROVED':
        return <Chip label="승인됨" color="success" size="medium" icon={<CheckCircleIcon />} />;
      case 'EDITED':
        return <Chip label="수정됨" color="info" size="medium" icon={<EditIcon />} />;
      case 'REJECTED':
        return <Chip label="반려됨" color="error" size="medium" />;
      case 'HIDDEN':
        return <Chip label="숨김" color="default" size="medium" icon={<BlockIcon />} />;
      case 'REPORTED':
        return <Chip label="신고됨" color="error" size="medium" />;
      default:
        return <Chip label="상태 없음" color="default" size="medium" />;
    }
  };

  // 평점별 색상 및 설명
  const getRatingColor = (rating) => {
    if (rating >= 4) return "#4CAF50"; // 좋음
    if (rating >= 3) return "#FF9800"; // 보통
    return "#F44336"; // 나쁨
  };

  const getRatingText = (rating) => {
    if (rating >= 4) return "매우 만족";
    if (rating >= 3) return "보통";
    return "불만족";
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !review) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={64} sx={{ color: '#113F67' }} />
      </Box>
    );
  }

  if (error && !review) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/admin/review/list")}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button 
          variant="text" 
          onClick={() => navigate("/admin/review/list")}
          sx={{ color: '#58A0C8' }}
        >
          ← 리뷰 관리
        </Button>
        <Typography variant="h4" fontWeight={700}>
          리뷰 상세보기
        </Typography>
        {review && (
          <Chip 
            label={`ID: ${review.reviewId}`} 
            variant="outlined" 
            size="small"
            sx={{ ml: 'auto' }}
          />
        )}
      </Stack>

      {/* 성공/에러 알림 */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, backgroundColor: '#E8F5E8', border: '1px solid #4CAF50' }}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, backgroundColor: '#FFEBEE', border: '1px solid #F44336' }}
        >
          {error}
        </Alert>
      )}

      {review && (
        <Grid container spacing={3}>
          {/* 왼쪽 컬럼 - 기본 정보 */}
          <Grid item xs={12} md={8}>
            {/* 리뷰 내용 카드 */}
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                    리뷰 내용
                  </Typography>
                  {isEditing ? (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="저장">
                        <IconButton 
                          color="primary" 
                          onClick={handleSave}
                          disabled={loading}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="취소">
                        <IconButton 
                          color="default" 
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Tooltip title="수정">
                      <IconButton 
                        color="info" 
                        onClick={handleEdit}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Grid container spacing={3}>
                  {/* 평점 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      평점
                    </Typography>
                    {isEditing ? (
                      <Box>
                        <Rating
                          value={editData.rating}
                          onChange={(_, value) => handleInputChange('rating', value || 0)}
                          size="large"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          ({editData.rating}/5) - {getRatingText(editData.rating)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Rating 
                          value={review.rating || 0} 
                          readOnly 
                          size="large"
                          sx={{ '& .MuiRating-iconFilled': { color: getRatingColor(review.rating || 0) } }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 1, 
                            color: getRatingColor(review.rating || 0),
                            fontWeight: 600
                          }}
                        >
                          ({review.rating || 0}/5) - {getRatingText(review.rating || 0)}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* 상태 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      상태
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth>
                        <Select
                          value={editData.stateEnum}
                          onChange={(e) => handleInputChange('stateEnum', e.target.value)}
                        >
                          <MenuItem value="PENDING">등록 대기</MenuItem>
                          <MenuItem value="APPROVED">승인됨</MenuItem>
                          <MenuItem value="EDITED">수정됨</MenuItem>
                          <MenuItem value="REJECTED">반려됨</MenuItem>
                          <MenuItem value="HIDDEN">숨김</MenuItem>
                          <MenuItem value="REPORTED">신고됨</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      renderStatusChip(review.stateEnum)
                    )}
                  </Grid>

                  {/* 리뷰 내용 */}
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      리뷰 내용
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        placeholder="리뷰 내용을 입력하세요"
                        variant="outlined"
                      />
                    ) : (
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 1,
                          minHeight: 100,
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {review.reason || review.content || "내용 없음"}
                        </Typography>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 운송 정보 카드 */}
            {review.deliveryAssignment && (
              <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <ShippingIcon color="primary" />
                    <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                      운송 정보
                    </Typography>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        운송 ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {review.deliveryAssignment.assignedId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        운송 상태
                      </Typography>
                      <Chip 
                        label="운송 완료" 
                        color="success" 
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 오른쪽 컬럼 - 메타 정보 */}
          <Grid item xs={12} md={4}>
            {/* 기본 정보 카드 */}
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                    기본 정보
                  </Typography>
                </Stack>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      리뷰 ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      #{review.reviewId}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      등록일
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(review.regDate)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      수정일
                    </Typography>
                    <Typography variant="body1">
                      {review.modiDate ? formatDate(review.modiDate) : "수정되지 않음"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* 평점 통계 카드 */}
            <Card elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <StarIcon color="primary" />
                  <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                    평점 통계
                  </Typography>
                </Stack>
                
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ color: getRatingColor(review.rating || 0), fontWeight: 700 }}>
                    {review.rating || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 5점
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                    {getRatingText(review.rating || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* 작업 버튼 카드 */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600, mb: 2 }}>
                  작업
                </Typography>
                
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate("/admin/review/list")}
                    sx={{ backgroundColor: '#58A0C8' }}
                  >
                    목록으로
                  </Button>
                  
                  {!isEditing && (
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={handleEdit}
                      startIcon={<EditIcon />}
                    >
                      수정
                    </Button>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    fullWidth
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    startIcon={<DeleteIcon />}
                  >
                    삭제
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>리뷰 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewForm;
