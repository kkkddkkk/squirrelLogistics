import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Stack,
  MenuItem,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchCompletedDeliveries } from "../../api/deliveryRequest/deliveryCompletedAPI";
import { CommonTitle } from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
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

      switch (sort) {
        case "latest":
          return new Date(completedAtB) - new Date(completedAtA);
        case "oldest":
          return new Date(completedAtA) - new Date(completedAtB);
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
    <>
      <Header />
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <CommonTitle>운송 완료 목록</CommonTitle>

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
            </TextField>
          </Stack>

          {/* 리스트 */}
          <Box>
            {paginatedData.map((row, idx) => {
              // 새로운 응답 구조에서 additionalInfo를 통해 필요한 데이터에 접근
              const additionalInfo = row.additionalInfo || {};
              const assignedId = additionalInfo.assignedId;
              const status = additionalInfo.status;
              const completedAt = additionalInfo.completedAt;
              const startAddress = additionalInfo.startAddress;
              const endAddress = additionalInfo.endAddress;

              return (
                <Paper
                  key={idx}
                  onClick={() =>
                    navigate(`/driver/deliveredetail/${assignedId}`)
                  }
                  sx={{
                    p: 3,
                    mb: 2,
                    border: "0.8px solid",
                    borderColor: theme.palette.primary.light,
                    boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: 1.5,
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    bgcolor: theme.palette.background.paper,
                    "&:hover": {
                      bgcolor: theme.palette.background.default,
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      {/* 상단: 운송번호와 상태+날짜 */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={theme.palette.primary.main}
                        >
                          운송번호 #{assignedId}
                        </Typography>

                        {/* 우측 상단: 상태 + 완료일자 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor:
                                status === "COMPLETED" ? "#e8f5e8" : "#f5f5f5",
                              color:
                                status === "COMPLETED" ? "#2e7d32" : "#666",
                            }}
                          >
                            {status === "COMPLETED" ? "배송완료" : status}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {completedAt
                              ? dayjs(completedAt).format("YYYY.MM.DD")
                              : "-"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* 하단: 출발지, 도착지 */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          <strong>출발지:</strong> {startAddress || "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>도착지:</strong> {endAddress || "-"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 화살표 아이콘 */}
                    <ChevronRight
                      sx={{ color: theme.palette.text.secondary, fontSize: 24 }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>

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
      <Footer />
    </>
  );
};

export default DeliveredList;
