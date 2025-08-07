// DeliveredList.jsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Stack,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 🚧 실제 API 연동 전까지는 임시 mock 데이터 사용
const mockDeliveredData = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  date: `2025-08-${(i % 28) + 1}`,
  origin: "서울 강남구",
  destination: "부산 해운대구",
  cargo: "가전제품",
  price: "450,000원",
}));

const ITEMS_PER_PAGE = 10;

const DeliveredList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const filteredData = mockDeliveredData
    .filter(
      (item) =>
        item.origin.toLowerCase().includes(search.toLowerCase()) ||
        item.destination.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "latest") return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        {/* 검색 및 정렬 */}
        <Stack direction="row" spacing={2} mb={4} sx={{ width: "100%" }}>
          <TextField
            label="검색 (출발지 / 도착지)"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            size="small"
            label="정렬"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="latest">최신순</MenuItem>
            <MenuItem value="oldest">오래된순</MenuItem>
          </TextField>
        </Stack>

        {/* 운송 기록 테이블 */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: "#113F67" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontSize: "1rem" }}>
                  날짜
                </TableCell>
                <TableCell sx={{ color: "white", fontSize: "1rem" }}>
                  출발지
                </TableCell>
                <TableCell sx={{ color: "white", fontSize: "1rem" }}>
                  도착지
                </TableCell>
                <TableCell sx={{ color: "white", fontSize: "1rem" }}>
                  화물
                </TableCell>
                <TableCell sx={{ color: "white", fontSize: "1rem" }}>
                  금액
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontSize: "1rem" }}
                  align="center"
                >
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} hover sx={{ height: 72 }}>
                  <TableCell sx={{ fontSize: "1.05rem" }}>{row.date}</TableCell>
                  <TableCell sx={{ fontSize: "1.05rem" }}>
                    {row.origin}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.05rem" }}>
                    {row.destination}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.05rem" }}>
                    {row.cargo}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.05rem" }}>
                    {row.price}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="column" spacing={1} alignItems="center">
                      {/* ❗ RequestDetailPage 없으면 주석 처리 */}
                      {/* <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/driver/delivereddetail/${row.id}`)}
                        sx={{ width: 120, py: 1 }}
                      >
                        다시 운송하기
                      </Button> */}
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{ width: 120, py: 1 }}
                      >
                        다시 운송하기
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          width: 120,
                          py: 1,
                          bgcolor: "#E8A93F",
                          color: "white",
                        }}
                        onClick={handleOpenModal}
                      >
                        정산내역
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {filteredData.length > ITEMS_PER_PAGE && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        )}

        {/* 정산내역 모니터링 */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>정산 내역</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="text.secondary">
              정산 정보는 추후 여기에 표시됩니다.
            </Typography>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DeliveredList;
