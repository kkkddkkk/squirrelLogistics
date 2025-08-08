import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Stack,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const mockDeliveredData = Array.from({ length: 23 }).map((_, i) => ({
  actualDelivery_id: `#9933${i + 1}`,
  date: `2025.08.${((i % 28) + 1).toString().padStart(2, "0")}`,
  company_id: "(주)마녀공장",
  user_id: "김인주",
  product_id: `앰플세럼 세트 외 ${(i % 5) + 1}건`,
  deliveryStatus: "배송완료",
}));

const ITEMS_PER_PAGE = 10;

const DeliveredList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const filteredData = mockDeliveredData
    .filter((item) =>
      `${item.company_id}${item.user_id}${item.product_id}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sort) {
        case "latest":
          return new Date(b.date) - new Date(a.date);
        case "oldest":
          return new Date(a.date) - new Date(b.date);
        case "product":
          return a.product_id.localeCompare(b.product_id);
        case "customer":
          return a.user_id.localeCompare(b.user_id);
        default:
          return 0;
      }
    });

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={4} color="#113F67">
          운송 완료 목록
        </Typography>

        {/* 검색 + 정렬 */}
        <Stack direction="row" spacing={2} mb={4}>
          <TextField
            label="검색 (기업처 / 고객명 / 상품명)"
            variant="outlined"
            size="medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
            InputLabelProps={{ sx: { fontSize: "1rem" } }}
          />
          <TextField
            select
            size="medium"
            label="정렬"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
            InputLabelProps={{ sx: { fontSize: "1rem" } }}
          >
            <MenuItem value="latest">최신순</MenuItem>
            <MenuItem value="oldest">오래된순</MenuItem>
            <MenuItem value="product">상품명순</MenuItem>
            <MenuItem value="customer">고객명순</MenuItem>
          </TextField>
        </Stack>

        {/* 테이블 */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: "#113F67" }}>
              <TableRow>
                {[
                  "운송번호",
                  "처리상태",
                  "운송완료일자",
                  "기업처",
                  "고객명",
                  "상품명",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "white",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      py: 2.5,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{ height: 72, cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/driver/deliveredetail/${row.actualDelivery_id}`)
                  }
                >
                  <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                    {row.actualDelivery_id}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                    {row.deliveryStatus}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                    {row.company_id}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                    {row.user_id}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "1.1rem",
                      py: 2.5,
                      maxWidth: 300,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.product_id}
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
              size="large"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default DeliveredList;
