import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchCompletedDeliveries } from "../../api/deliveryRequest/deliveryCompletedAPI";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const DeliveredList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [deliveredData, setDeliveredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompletedDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCompletedDeliveries();
        setDeliveredData(data);
      } catch (err) {
        setError("운송 완료 목록을 불러오는데 실패했습니다.");
        console.error("운송 완료 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedDeliveries();
  }, []);

  const filteredData = deliveredData
    .filter((item) => {
      // 새로운 응답 구조에서 additionalInfo를 통해 주소 정보에 접근
      const additionalInfo = item.additionalInfo || {};
      const startAddress = additionalInfo.startAddress || "";
      const endAddress = additionalInfo.endAddress || "";
      return `${startAddress}${endAddress}`
        .toLowerCase()
        .includes(search.toLowerCase());
    })
    .sort((a, b) => {
      // 새로운 응답 구조에서 additionalInfo를 통해 완료일자에 접근
      const additionalInfoA = a.additionalInfo || {};
      const additionalInfoB = b.additionalInfo || {};
      const completedAtA = additionalInfoA.completedAt;
      const completedAtB = additionalInfoB.completedAt;
      const startAddressA = additionalInfoA.startAddress || "";
      const startAddressB = additionalInfoB.startAddress || "";
      
      switch (sort) {
        case "latest":
          return new Date(completedAtB) - new Date(completedAtA);
        case "oldest":
          return new Date(completedAtA) - new Date(completedAtB);
        case "product":
          return startAddressA.localeCompare(startAddressB);
        default:
          return 0;
      }
    });

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "#F5F7FA",
          minHeight: "100vh",
          py: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" mb={4} color="#113F67">
          운송 완료 목록
        </Typography>

        {/* 검색 + 정렬 */}
        <Stack direction="row" spacing={2} mb={4}>
          <TextField
            label="검색 (출발지 / 도착지)"
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
            <MenuItem value="product">출발지순</MenuItem>
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
                  "출발지",
                  "도착지",
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
            {/* 홀수/짝수 행 배경색 변경 (색상 변경) */}
            <TableBody
              sx={{
                "& tr:nth-of-type(odd)": {
                  backgroundColor: "#ffffff",
                },
                "& tr:nth-of-type(even)": {
                  backgroundColor: "#f3f6faff", // 더 눈에 띄는 색상으로 변경
                },
              }}
            >
              {paginatedData.map((row, idx) => {
                // 새로운 응답 구조에서 additionalInfo를 통해 필요한 데이터에 접근
                const additionalInfo = row.additionalInfo || {};
                const assignedId = additionalInfo.assignedId;
                const status = additionalInfo.status;
                const completedAt = additionalInfo.completedAt;
                const startAddress = additionalInfo.startAddress;
                const endAddress = additionalInfo.endAddress;
                
                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{ height: 72, cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/driver/deliveredetail/${assignedId}`)
                    }
                  >
                    <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                      #{assignedId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                      {status === "COMPLETED" ? "배송완료" : status}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                      {completedAt
                        ? dayjs(completedAt).format("YYYY.MM.DD")
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                      {startAddress || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1.1rem", py: 2.5 }}>
                      {endAddress || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
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
