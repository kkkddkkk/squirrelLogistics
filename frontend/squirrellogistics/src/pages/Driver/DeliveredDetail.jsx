import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryRouteMap from "../../components/driver/DeliveryRouteMap";
import { fetchDeliveryDetail } from "../../api/deliveryRequest/deliveryCompletedAPI";
import dayjs from "dayjs";

const DeliveredDetail = () => {
  const navigate = useNavigate();
  const { assignedId } = useParams();
  const [deliveryData, setDeliveryData] = useState(null);
  const [distanceWeight, setDistanceWeight] = useState({
    distance: 0,
    weight: 0,
  });
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDeliveryDetail = async () => {
      try {
        setLoading(true);
        console.log("API 호출 시작:", assignedId);

        // 운송 상세 정보 조회 (기존 DTO들을 조합한 Map 사용)
        const data = await fetchDeliveryDetail(assignedId);

        console.log("=== API 응답 데이터 ===");
        console.log("전체 데이터:", data);
        
        // 새로운 응답 구조에서 데이터 추출
        const additionalInfo = data?.additionalInfo || {};
        const request = data?.request || {};
        const actualDelivery = data?.actualDelivery || {};
        const waypoints = data?.waypoints || [];
        
        console.log("additionalInfo:", additionalInfo);
        console.log("request:", request);
        console.log("actualDelivery:", actualDelivery);
        console.log("waypoints:", waypoints);
        console.log("URL 파라미터 assignedId:", assignedId);

        setDeliveryData(data);
        setDistanceWeight({
          distance: actualDelivery.distance || 0,
          weight: actualDelivery.weight || 0,
        });
        setWaypoints(
          waypoints.map((wp) => wp.address || wp.waypointId)
        );
      } catch (err) {
        console.error("운송 상세 정보 로드 실패:", err);
        console.error("오류 상세:", err.response?.data || err.message);
        setError(`운송 상세 정보를 불러오는데 실패했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (assignedId) {
      loadDeliveryDetail();
    }
  }, [assignedId]);

  const formatPrice = (price) => `₩${price?.toLocaleString() || 0}`;
  const formatDate = (dateString) => {
    return dayjs(dateString).format("YYYY.MM.DD");
  };

  // 요금 계산 함수
  const calculateFees = (deliveryData) => {
    if (!deliveryData)
      return {
        baseFee: 0,
        distanceFee: 0,
        weightFee: 0,
        waypointFee: 0,
        mountainousFee: 0,
        cautionFee: 0,
        totalFee: 0,
      };

    // 새로운 응답 구조에서 데이터 추출
    const actualDelivery = deliveryData.actualDelivery || {};
    const waypoints = deliveryData.waypoints || [];
    
    const distance = actualDelivery.distance || 0;
    const weight = actualDelivery.weight || 0;
    const mountainous = actualDelivery.mountainous || false;
    const caution = actualDelivery.caution || false;

    // 기본요금 계산 (거리 × 무게 × 단가)
    const baseFee = 100000; // 기본요금 10만원

    // 거리별 요금 (1km당 3,000원)
    const distanceFee = Math.floor(distance / 1000) * 3000;

    // 무게별 요금 (1kg당 30,000원)
    const weightFee = Math.ceil(weight / 1000) * 30000;

    // 경유지 요금 (경유지당 50,000원)
    const waypointFee = waypoints.length * 50000;

    // 산간지역 요금
    const mountainousFee = mountainous ? 50000 : 0;

    // 취급주의 요금
    const cautionFee = caution ? 50000 : 0;

    // 총 요금
    const totalFee =
      baseFee +
      distanceFee +
      weightFee +
      waypointFee +
      mountainousFee +
      cautionFee;

    return {
      baseFee,
      distanceFee,
      weightFee,
      waypointFee,
      mountainousFee,
      cautionFee,
      totalFee,
    };
  };

  const tableStyle = {
    backgroundColor: "#F5F7FA",
    "& .MuiTableCell-root": {
      borderBottom: "1px solid #ccc",
      borderRight: "none",
    },
  };

  const handleIconClick = () => {
    navigate("/admin/Support/Policy/PolicyPage");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#F5F7FA",
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

  if (!deliveryData) {
    return (
      <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="lg">
          <Alert severity="warning">운송 데이터를 찾을 수 없습니다.</Alert>
        </Container>
      </Box>
    );
  }

  // 경로 정보 구성
  const routeInfo = [
    {
      location: deliveryData.startAddress || "상차지 정보 없음",
      time: formatDate(deliveryData.assignedAt),
    },
    {
      location: deliveryData.endAddress || "하차지 정보 없음",
      time: formatDate(deliveryData.completedAt),
    },
  ];

  // 경유지가 있으면 추가
  if (waypoints && waypoints.length > 0) {
    waypoints.forEach((waypoint, index) => {
      routeInfo.splice(1 + index, 0, {
        location: waypoint,
        time: "경유지",
      });
    });
  }

  return (
    <Box sx={{ bgcolor: "#F5F7FA", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#2A2A2A">
          운송 상세
        </Typography>

        <Typography variant="h4" fontWeight="bold" gutterBottom color="#2A2A2A">
          # {assignedId}
        </Typography>

        {/* 운송 일정 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              운송 내역
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            {/* 왼쪽: 일정 */}
            <Box
              sx={{
                width: "50%",
                backgroundColor: "#F5F7FA",
                borderRadius: 2,
                px: 2,
                py: 1,
              }}
            >
              {[
                { label: "운송 ID", value: deliveryData.assignedId },
                {
                  label: "운송 시작일",
                  value: formatDate(deliveryData.assignedAt),
                },
                {
                  label: "운송 완료일",
                  value: formatDate(deliveryData.completedAt),
                },
                {
                  label: "상차지",
                  value: `${routeInfo[0].location} (${routeInfo[0].time})`,
                },
                ...(routeInfo.length > 2
                  ? routeInfo.slice(1, -1).map((waypoint, index) => ({
                      label: `경유지 ${index + 1}`,
                      value: `${waypoint.location} (${waypoint.time})`,
                    }))
                  : []),
                {
                  label: "하차지",
                  value: `${routeInfo[routeInfo.length - 1].location} (${
                    routeInfo[routeInfo.length - 1].time
                  })`,
                },
                {
                  label: "",
                  value: (
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        color: "#d45d55ff",
                        textAlign: "right",
                        width: "100%",
                        pr: 0.1,
                        mt: 1.0,
                        fontWeight: "medium",
                      }}
                    >
                      지도를 확대하거나 축소해서 경로를 확인해보세요.
                    </Typography>
                  ),
                },
              ].map((item, idx, arr) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    px: 2,
                    py: 2,
                    borderBottom:
                      idx !== arr.length - 1 ? "1px solid #ccc" : "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>{item.label}</Typography>
                  <Typography>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* 오른쪽: 지도 */}
            <Box
              sx={{
                width: "50%",
                height: 500,
                border: "1px solid #ccc",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {window.kakao && window.kakao.maps ? (
                <DeliveryRouteMap
                  locations={routeInfo.map((r) => r.location)}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    bgcolor: "#f5f5f5",
                  }}
                >
                  <Typography>지도를 불러오는 중...</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* 정산 내역 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              정산 내역
            </Typography>
          </Box>
          <Box sx={tableStyle}>
            <Table>
              <TableBody>
                {(() => {
                  const fees = calculateFees(deliveryData);
                  return (
                    <>
                      <TableRow>
                        <TableCell>기본요금</TableCell>
                        <TableCell>{formatPrice(fees.baseFee)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>거리별 요금</TableCell>
                        <TableCell>{formatPrice(fees.distanceFee)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>무게별 요금</TableCell>
                        <TableCell>{formatPrice(fees.weightFee)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>경유지 요금</TableCell>
                        <TableCell>
                          {fees.waypointFee > 0
                            ? formatPrice(fees.waypointFee)
                            : "해당없음"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>산간지역 요금</TableCell>
                        <TableCell>
                          {fees.mountainousFee > 0
                            ? formatPrice(fees.mountainousFee)
                            : "해당없음"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>취급주의 요금</TableCell>
                        <TableCell>
                          {fees.cautionFee > 0
                            ? formatPrice(fees.cautionFee)
                            : "해당없음"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#1976D2" }}
                        >
                          총 운송료
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#1976D2" }}
                        >
                          {formatPrice(fees.totalFee)}
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })()}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 목록으로 버튼 */}
        <Box display="flex" justifyContent="center" mt={6}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#113F67",
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": { bgcolor: "#0d3050" },
            }}
            onClick={() => navigate("/driver/deliveredlist")}
          >
            목록으로
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveredDetail;
