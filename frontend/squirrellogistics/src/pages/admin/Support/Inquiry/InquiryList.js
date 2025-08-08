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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
// import { getInquiries } from "./inquiryApi";

const InquiryList = () => {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  // 🔧 백엔드 연결 전 mock 데이터
  useEffect(() => {
    setInquiries([
      {
        id: 1,
        userName: "홍길동",
        title: "배송 관련 문의",
        status: "답변 완료",
        createdAt: "2025-08-01",
      },
      {
        id: 2,
        userName: "김영희",
        title: "정산 지연 문의",
        status: "미처리",
        createdAt: "2025-08-02",
      },
      // ... 더미 추가 가능
    ]);
  }, []);

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

  const filtered = inquiries.filter((inq) =>
    inq.title.toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        1:1 문의 관리
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="문의 제목 검색"
          value={search}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
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
              {paged.map((inquiry) => (
                <TableRow key={inquiry.id} hover>
                  <TableCell>{inquiry.title}</TableCell>
                  <TableCell>{inquiry.userName}</TableCell>
                  <TableCell>{inquiry.createdAt}</TableCell>
                  <TableCell>{inquiry.status}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="자세히 보기">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`${inquiry.id}`)}
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
