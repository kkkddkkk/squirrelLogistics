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
import { CommonTitle } from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";
import LoadingComponent from "../../components/common/LoadingComponent";
import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";

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
      <LoadingComponent open={loading} text="운송 완료 목록을 불러오는 중..." />
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <DriverHeader_Temp />
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
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
              InputLabelProps={{ sx: { fontSize: "1rem" } }}
            />
            <TextField
              select
              size="medium"
              label="정렬"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              sx={{
                width: 200,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
              InputLabelProps={{ sx: { fontSize: "1rem" } }}
            >
              <MenuItem value="latest">최신순</MenuItem>
              <MenuItem value="oldest">오래된순</MenuItem>
              <MenuItem value="product">출발지순</MenuItem>
            </TextField>
          </Stack>

          {/* 운송 완료 목록 */}
          <Stack spacing={2}>
            {paginatedData.map((row, idx) => {
              // 새로운 응답 구조에서 additionalInfo를 통해 필요한 데이터에 접근
              const additionalInfo = row.additionalInfo || {};
              const assignedId = additionalInfo.assignedId;
              const status = additionalInfo.status;
              const completedAt = additionalInfo.completedAt;
              const startAddress = additionalInfo.startAddress;
              const endAddress = additionalInfo.endAddress;

              return (
                <Box
                  key={idx}
                  onClick={() =>
                    navigate(`/driver/deliveredetail/${assignedId}`)
                  }
                  sx={{
                    margin: 0,
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
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {/* 상단: 운송번호 + 배송완료/완료일자 */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                        }}
                      >
                        운송번호 #{assignedId}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor:
                              status === "COMPLETED"
                                ? theme.palette.success.main
                                : theme.palette.text.secondary,
                            color: "white",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                          }}
                        >
                          {status === "COMPLETED" ? "배송완료" : status}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={theme.palette.text.secondary}
                          sx={{ fontSize: "0.875rem" }}
                        >
                          완료일:{" "}
                          {completedAt
                            ? dayjs(completedAt).format("YYYY.MM.DD")
                            : "-"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 하단: 출발지/도착지 */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 4, flex: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                            sx={{ mb: 0.5 }}
                          >
                            출발지
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "500" }}
                          >
                            {startAddress || "-"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                            sx={{ mb: 0.5 }}
                          >
                            도착지
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "500" }}
                          >
                            {endAddress || "-"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 3 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          →
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          {/* 페이지네이션 */}
          {filteredData.length > ITEMS_PER_PAGE && (
            <Stack alignItems="center" mt={4}>
              <Pagination
                count={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.background.paper,
                    },
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.background.paper,
                    },
                  },
                }}
              />
            </Stack>
          )}

          {/* 데이터가 없을 때 */}
          {filteredData.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color={theme.palette.text.secondary}>
                운송 완료 내역이 없습니다.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default DeliveredList;
