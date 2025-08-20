import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  TablePagination,
  InputAdornment,
  Tooltip,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportIcon from "@mui/icons-material/Report";
import { useNavigate } from "react-router-dom";
import { getReportedReviews, hideReview, approveReview, rejectReview } from "./reviewApi";

const ReportedReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const navigate = useNavigate();

  // 신고된 리뷰 데이터 로드
  useEffect(() => {
    loadReportedReviews();
  }, []);

  const loadReportedReviews = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("신고된 리뷰 데이터 로드 시작...");
      const data = await getReportedReviews();
      console.log("로드된 신고된 리뷰 데이터:", data);
      
      if (data && Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.error("신고된 리뷰 데이터 로드 실패:", e);
      setError("신고된 리뷰 목록을 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // 검색 필터링
  const filtered = reviews.filter((review) =>
    review.reason && review.reason.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 상태별 칩 렌더링
  const renderStatusChip = (status) => {
    switch (status) {
      case 'REPORTED':
        return <Chip label="신고됨" color="error" size="small" icon={<ReportIcon />} />;
      case 'HIDDEN':
        return <Chip label="숨김" color="default" size="small" icon={<BlockIcon />} />;
      case 'REJECTED':
        return <Chip label="반려됨" color="error" size="small" />;
      default:
        return <Chip label="상태 없음" color="default" size="small" />;
    }
  };

  // 액션 다이얼로그 열기
  const openActionDialog = (review, type) => {
    setSelectedReview(review);
    setActionType(type);
    setActionDialogOpen(true);
  };

  // 액션 다이얼로그 닫기
  const closeActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedReview(null);
    setActionType("");
    setRejectionReason("");
  };

  // 리뷰 승인
  const handleApprove = async () => {
    try {
      await approveReview(selectedReview.reviewId);
      closeActionDialog();
      loadReportedReviews();
    } catch (e) {
      console.error("리뷰 승인 실패:", e);
      setError("리뷰 승인에 실패했습니다.");
    }
  };

  // 리뷰 숨김 처리
  const handleHide = async () => {
    try {
      await hideReview(selectedReview.reviewId);
      closeActionDialog();
      loadReportedReviews();
    } catch (e) {
      console.error("리뷰 숨김 처리 실패:", e);
      setError("리뷰 숨김 처리에 실패했습니다.");
    }
  };

  // 리뷰 반려
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("반려 사유를 입력해주세요.");
      return;
    }

    try {
      await rejectReview(selectedReview.reviewId, rejectionReason);
      closeActionDialog();
      loadReportedReviews();
    } catch (e) {
      console.error("리뷰 반려 실패:", e);
      setError("리뷰 반려에 실패했습니다.");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        신고된 리뷰 관리
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        사용자로부터 신고가 접수된 리뷰를 관리합니다. 각 리뷰를 검토하여 적절한 조치를 취하세요.
      </Typography>

      {/* 에러 알림 */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            backgroundColor: '#FFEBEE',
            border: '1px solid #F44336',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#D32F2F' }
          }} 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
            검색 및 필터
          </Typography>
          <Button 
            variant="outlined"
            onClick={loadReportedReviews}
            disabled={loading}
            sx={{ 
              borderColor: '#58A0C8',
              color: '#58A0C8',
              '&:hover': { 
                borderColor: '#34699A',
                backgroundColor: 'rgba(88, 160, 200, 0.04)'
              }
            }}
          >
            새로고침
          </Button>
        </Stack>
        
        <TextField
          fullWidth
          placeholder="리뷰 내용 검색"
          value={search}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#58A0C8' }} />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#113F67" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>평점</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>리뷰 내용</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>작성자</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>대상자</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>신고 사유</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>등록일</TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#113F67' }} />
                    <Typography variant="body1" sx={{ mt: 2, color: '#909095' }}>
                      신고된 리뷰를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="#909095" sx={{ mb: 1 }}>
                      {search ? `"${search}" 검색 결과가 없습니다.` : "신고된 리뷰가 없습니다."}
                    </Typography>
                    <Typography variant="body2" color="#909095">
                      {search ? "다른 검색어를 시도해보세요." : "새로운 신고가 접수될 때까지 기다려주세요."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.map((review) => (
                <TableRow key={review.reviewId} hover>
                  <TableCell>
                    <Rating value={review.rating || 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({review.rating || 0}/5)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }}>
                      {review.reason || "내용 없음"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {review.reporter || "작성자 정보 없음"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {review.deliveryAssignment?.driverName || "기사 정보 없음"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={review.reportReason || "욕설/비방"} 
                      color="error" 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {review.regDate ? new Date(review.regDate).toLocaleDateString('ko-KR') : "날짜 없음"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="자세히 보기">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin/review/${review.reviewId}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="승인">
                        <IconButton
                          color="success"
                          onClick={() => openActionDialog(review, 'approve')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="숨김 처리">
                        <IconButton
                          color="warning"
                          onClick={() => openActionDialog(review, 'hide')}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </Paper>

      {/* 액션 다이얼로그 */}
      <Dialog open={actionDialogOpen} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' && '리뷰 승인'}
          {actionType === 'hide' && '리뷰 숨김 처리'}
          {actionType === 'reject' && '리뷰 반려'}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>리뷰 내용:</strong> {selectedReview.reason}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>작성자:</strong> {selectedReview.reporter}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>평점:</strong> {selectedReview.rating}/5
              </Typography>
              
              {actionType === 'reject' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    반려 사유를 입력해주세요:
                  </Typography>
                  <TextareaAutosize
                    minRows={3}
                    placeholder="반려 사유를 입력하세요..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontFamily: 'inherit'
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>취소</Button>
          {actionType === 'approve' && (
            <Button onClick={handleApprove} color="success" variant="contained">
              승인
            </Button>
          )}
          {actionType === 'hide' && (
            <Button onClick={handleHide} color="warning" variant="contained">
              숨김 처리
            </Button>
          )}
          {actionType === 'reject' && (
            <Button onClick={handleReject} color="error" variant="contained">
              반려
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportedReviewList;
