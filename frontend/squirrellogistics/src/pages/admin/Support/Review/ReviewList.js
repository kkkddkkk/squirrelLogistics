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
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import { useNavigate } from "react-router-dom";
import { getReviews, deleteReview, hideReview, approveReview } from "./reviewApi";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useNavigate();

  // 리뷰 데이터 로드
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("리뷰 데이터 로드 시작...");
      const data = await getReviews();
      console.log("로드된 리뷰 데이터:", data);
      
      if (data && Array.isArray(data)) {
        console.log("원본 데이터 구조:", data[0]);
        setReviews(data);
      } else {
        console.warn("리뷰 데이터가 배열이 아닙니다:", data);
        setReviews([]);
      }
    } catch (e) {
      console.error("리뷰 데이터 로드 실패:", e);
      setError("리뷰 목록을 불러오지 못했습니다. 다시 시도해주세요.");
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

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  // 검색 및 탭별 필터링
  const getFilteredReviews = () => {
    let filtered = reviews.filter((review) =>
      review.reason && review.reason.toLowerCase().includes(search.toLowerCase())
    );

    // 탭별 필터링
    switch (activeTab) {
      case 0: // 전체
        return filtered;
      case 1: // 승인됨
        return filtered.filter(review => review.stateEnum === 'APPROVED');
      case 2: // 대기중
        return filtered.filter(review => review.stateEnum === 'PENDING');
      case 3: // 신고됨
        return filtered.filter(review => review.stateEnum === 'REPORTED');
      case 4: // 숨김
        return filtered.filter(review => review.stateEnum === 'HIDDEN');
      default:
        return filtered;
    }
  };

  const filtered = getFilteredReviews();
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 상태별 칩 렌더링
  const renderStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="대기중" color="warning" size="small" />;
      case 'APPROVED':
        return <Chip label="승인됨" color="success" size="small" />;
      case 'REJECTED':
        return <Chip label="반려됨" color="error" size="small" />;
      case 'HIDDEN':
        return <Chip label="숨김" color="default" size="small" />;
      case 'REPORTED':
        return <Chip label="신고됨" color="error" size="small" />;
      default:
        return <Chip label="상태 없음" color="default" size="small" />;
    }
  };

  // 리뷰 숨김 처리
  const handleHide = async (reviewId) => {
    if (window.confirm("이 리뷰를 숨김 처리하시겠습니까?")) {
      try {
        await hideReview(reviewId);
        loadReviews(); // 목록 새로고침
      } catch (e) {
        console.error("리뷰 숨김 처리 실패:", e);
        setError("리뷰 숨김 처리에 실패했습니다.");
      }
    }
  };

  // 리뷰 승인
  const handleApprove = async (reviewId) => {
    if (window.confirm("이 리뷰를 승인하시겠습니까?")) {
      try {
        await approveReview(reviewId);
        loadReviews(); // 목록 새로고침
      } catch (e) {
        console.error("리뷰 승인 실패:", e);
        setError("리뷰 승인에 실패했습니다.");
      }
    }
  };

  // 리뷰 삭제
  const handleDelete = async (reviewId) => {
    if (window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      try {
        await deleteReview(reviewId);
        loadReviews(); // 목록 새로고침
      } catch (e) {
        console.error("리뷰 삭제 실패:", e);
        setError("리뷰 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        리뷰 관리
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        사용자들이 작성한 리뷰를 관리하고 모니터링합니다. 
        상세 페이지에서 더 자세한 관리 작업을 수행할 수 있습니다.
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
        {/* 탭 메뉴 */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="전체" />
          <Tab label="승인됨" />
          <Tab label="대기중" />
          <Tab label="신고됨" />
          <Tab label="숨김" />
        </Tabs>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
            검색 및 필터
          </Typography>
          <Button 
            variant="outlined"
            onClick={loadReviews}
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
                <TableCell sx={{ color: "white", fontWeight: 600 }}>등록일</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>상태</TableCell>
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
                      리뷰를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="#909095" sx={{ mb: 1 }}>
                      {search ? `"${search}" 검색 결과가 없습니다.` : "등록된 리뷰가 없습니다."}
                    </Typography>
                    <Typography variant="body2" color="#909095">
                      {search ? "다른 검색어를 시도해보세요." : "새로운 리뷰가 등록될 때까지 기다려주세요."}
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
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
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
                    {review.regDate ? new Date(review.regDate).toLocaleDateString('ko-KR') : "날짜 없음"}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(review.stateEnum)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                             <Tooltip title="상세보기 및 관리">
                         <IconButton
                           color="primary"
                           onClick={() => navigate(`/admin/management/review/${review.reviewId}`)}
                         >
                           <VisibilityIcon />
                         </IconButton>
                       </Tooltip>
                      
                      {review.stateEnum === 'PENDING' && (
                        <Tooltip title="승인">
                          <IconButton
                            color="success"
                            onClick={() => handleApprove(review.reviewId)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {review.stateEnum === 'APPROVED' && (
                        <Tooltip title="숨김 처리">
                          <IconButton
                            color="warning"
                            onClick={() => handleHide(review.reviewId)}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="삭제">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(review.reviewId)}
                        >
                          <DeleteIcon />
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
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default ReviewList;
