import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
  Button,
  Alert,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ReportProblemOutlined as ReportIcon,
} from "@mui/icons-material";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import LoadingComponent from "../../components/common/LoadingComponent";
import {
  CommonTitle,
  CommonSubTitle,
} from "../../components/common/CommonText";
import { theme } from "../../components/common/CommonTheme";

const DriverReportList = () => {
  const thisTheme = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: 실제 API 호출로 대체
        // const response = await getDriverReports(userId);
        // setReports(response.data);

        // 임시 데이터 (테스트용)
        const mockReports = [
          {
            id: 1,
            category: "ETC",
            description: "차량 사고 발생했습니다.",
            status: "PENDING",
            createdAt: "2024-01-15T10:30:00",
          },
          {
            id: 2,
            category: "INAPPROPRIATE",
            description: "부적절한 운송요청이 있었습니다.",
            status: "COMPLETED",
            createdAt: "2024-01-10T14:20:00",
          },
        ];

        setReports(mockReports);
      } catch (error) {
        console.error("신고 목록 조회 실패:", error);
        setError("신고 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReports();
    }
  }, [userId]);

  const getCategoryLabel = (category) => {
    switch (category) {
      case "REVIEW":
        return "부적절한 리뷰";
      case "INAPPROPRIATE":
        return "부적절한 운송요청";
      case "EMERGENCY":
        return "긴급신고";
      case "ETC":
        return "차량 사고";
      default:
        return category;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "처리 중";
      case "COMPLETED":
        return "처리 완료";
      case "REJECTED":
        return "반려";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingComponent open={true} text="신고 목록을 불러오는 중..." />;
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
          {/* 헤더 */}
          <Box sx={{ mb: 4 }}>
            <Button
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "text.secondary",
                mb: 2,
                "&:hover": { color: "text.primary" },
              }}
            >
              뒤로가기
            </Button>
            <CommonTitle sx={{ color: "#113F67", mb: 2 }}>
              내 신고 내역
            </CommonTitle>
            <Typography variant="body1" color="text.secondary">
              본인이 작성한 신고 내역을 확인할 수 있습니다.
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 신고 목록 */}
          {reports.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <ReportIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
                아직 작성한 신고가 없습니다
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                긴급한 상황이 발생하면 신고해주세요
              </Typography>
            </Box>
          ) : (
            <Box>
              {reports.map((report) => (
                <Paper
                  key={report.id}
                  sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* 카테고리와 상태 */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Chip
                          label={getCategoryLabel(report.category)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={getStatusLabel(report.status)}
                          size="small"
                          color={getStatusColor(report.status)}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(report.createdAt)}
                      </Typography>
                    </Grid>

                    {/* 신고 내용 */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{
                          wordBreak: "break-word",
                          lineHeight: 1.5,
                        }}
                      >
                        {report.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default DriverReportList;
