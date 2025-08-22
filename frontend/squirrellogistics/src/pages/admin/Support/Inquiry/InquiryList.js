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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { getInquiries } from "./inquiryApi";

const InquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 실제 API 호출로 신고/문의 데이터 로드
  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("신고/문의 데이터 로드 시작...");
      const data = await getInquiries();
      console.log("로드된 신고/문의 데이터:", data);
      
      if (data && Array.isArray(data)) {
        console.log("원본 데이터 구조:", data[0]);
        setInquiries(data);
      } else {
        console.warn("신고/문의 데이터가 배열이 아닙니다:", data);
        setInquiries([]);
      }
    } catch (e) {
      console.error("신고/문의 데이터 로드 실패:", e);
      setError("신고/문의 목록을 불러오지 못했습니다. 다시 시도해주세요.");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // 검색 시 첫 페이지로 이동
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // 검색 필터링 - rTitle 기준으로 검색
  const filtered = inquiries.filter((inq) =>
    inq.rTitle && inq.rTitle.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 상태별 칩 렌더링
  const renderStatusChip = (status) => {
    switch (status) {
      case '대기 중':
        return <Chip label="대기 중" color="error" size="small" />;
      case '검토 중':
        return <Chip label="검토 중" color="info" size="small" />;
      case '조치 완료':
        return <Chip label="조치 완료" color="success" size="small" />;
      case '답변 완료':
        return <Chip label="답변 완료" color="success" size="small" />;
      case '완료':
        return <Chip label="완료" color="success" size="small" />;
      case '거부됨':
        return <Chip label="거부됨" color="error" size="small" />;
      case '미실행':
        return <Chip label="미실행" color="warning" size="small" />;
      case '처리 중':
        return <Chip label="처리 중" color="warning" size="small" />;
      case '오류':
        return <Chip label="오류" color="error" size="small" />;
      default:
        return <Chip label={status || "상태 없음"} color="default" size="small" />;
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        신고/문의 현황
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
            onClick={loadInquiries}
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
          placeholder="신고/문의 제목 검색"
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
                <TableCell sx={{ color: "white", fontWeight: 600 }}>제목</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>작성자</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>작성일</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>처리 상태</TableCell>
                <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>
                  보기
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#113F67' }} />
                    <Typography variant="body1" sx={{ mt: 2, color: '#909095' }}>
                      신고/문의를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="#909095" sx={{ mb: 1 }}>
                      {search ? `"${search}" 검색 결과가 없습니다.` : "등록된 신고/문의가 없습니다."}
                    </Typography>
                    <Typography variant="body2" color="#909095">
                      {search ? "다른 검색어를 시도해보세요." : "새로운 신고/문의가 등록될 때까지 기다려주세요."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.map((inquiry) => (
                <TableRow key={inquiry.reportId} hover>
                  <TableCell>
                    {inquiry.rTitle || "제목 없음"}
                  </TableCell>
                  <TableCell>
                    {inquiry.reporter || "사용자"}
                  </TableCell>
                  <TableCell>
                    {inquiry.regDate || "날짜 없음"}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(inquiry.rStatus)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="자세히 보기">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`${inquiry.reportId}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
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
        />
      </Paper>
    </Box>
  );
};

export default InquiryList;
