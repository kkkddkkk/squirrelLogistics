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
  useTheme,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchCompletedDeliveries } from "../../api/deliveryRequest/deliveryCompletedAPI";
import { CommonTitle } from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import dayjs from "dayjs";
import LoadingComponent from "../../components/common/LoadingComponent";

const ITEMS_PER_PAGE = 5;

const DeliveredList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [deliveredData, setDeliveredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const thisTheme = useTheme();
  const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));

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

  const query = search.toLowerCase();
  const filteredData = deliveredData
    .filter((item) => {
      const startAddress = item.startAddress || "";
      const endAddress = item.endAddress || "";
      return (startAddress + endAddress).toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const aTime = a.completedAt ? dayjs(a.completedAt).valueOf() : 0;
      const bTime = b.completedAt ? dayjs(b.completedAt).valueOf() : 0;
      if (sort === "latest") return bTime - aTime;
      if (sort === "oldest") return aTime - bTime;
      return 0;
    });

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (error) {
    return (
      <Box
        sx={{
          bgcolor: thisTheme.palette.background.paper,
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
    <>
      <Header />
      <CommonTitle>운송 완료 목록</CommonTitle>
      <Grid container>
        {loading && (
          <LoadingComponent open={loading} text="운송 내역을 불러오는 중..." />
        )}
        <Grid size={isMobile ? 1 : 2} />
        <Grid size={isMobile ? 10 : 8} mb={2}>
          {/* 검색 + 정렬 */}
          <Grid container spacing={2} marginBottom={4}>
            <Grid size={isMobile?12:9}>
              <TextField
                label="검색 (출발지 / 도착지)"
                variant="outlined"
                size="medium"
                value={search}
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
                InputLabelProps={{ sx: { fontSize: "1rem" } }}
              />
            </Grid>
            <Grid size={isMobile?12:3}>
              <TextField
                select
                size="medium"
                label="정렬"
                value={sort}
                fullWidth
                onChange={(e) => setSort(e.target.value)}
                InputProps={{ sx: { fontSize: "1.1rem", height: 50 } }}
                InputLabelProps={{ sx: { fontSize: "1rem" } }}
              >
                <MenuItem value="latest">최신순</MenuItem>
                <MenuItem value="oldest">오래된순</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* 리스트 */}
          <Box>
            {/* {filteredData} */}
            {paginatedData.map((row, idx) => {
              // 새로운 응답 구조에서 additionalInfo를 통해 필요한 데이터에 접근
              const assignedId = row.assignId;
              const startAddress = row.startAddress;
              const endAddress = row.endAddress;
              const completedAt = row.completedAt;
              const status = "COMPLETED";

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
                    borderColor: thisTheme.palette.text.secondary,
                    boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: 1.5,
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    bgcolor: thisTheme.palette.background.paper,
                    "&:hover": {
                      bgcolor: thisTheme.palette.background.default,
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      borderColor: thisTheme.palette.primary.main,
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
                          flexWrap: "wrap"
                        }}
                      >
                        <Typography
                          variant={isMobile?"subtitle1":"h6"}
                        
                          fontWeight="bold"
                          color={thisTheme.palette.primary.main}
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
                              border: `1px solid ${status === "COMPLETED" ? thisTheme.palette.success.main : thisTheme.palette.text.secondary}`,
                              // bgcolor: 
                              //   status === "COMPLETED" ? "#e8f5e8" : "#f5f5f5",
                              color:
                                status === "COMPLETED" ? thisTheme.palette.success.main : thisTheme.palette.text.secondary,
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
        </Grid>
      </Grid>
      <Grid size={isMobile ? 1 : 2} />
      <Footer />
    </>
  );
};

export default DeliveredList;
