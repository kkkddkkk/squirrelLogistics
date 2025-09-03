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
  Paper,
  useTheme,
  lighten,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryRouteMap from "../../components/driver/DeliveryRouteMap";
import { fetchDeliveryDetail } from "../../api/deliveryRequest/deliveryCompletedAPI";
import Header from "../Layout/Header"
import Footer from "../Layout/Footer"
import dayjs from "dayjs";
import PolylineMapComponent from "../../components/deliveryMap/PolylineMapComponent";

import { theme } from "../../components/common/CommonTheme";
import {
  CommonTitle,
  CommonSubTitle,
} from "../../components/common/CommonText";
import LoadingComponent from "../../components/common/LoadingComponent";

const DeliveredDetail = () => {
  const thisTheme = useTheme();
  const navigate = useNavigate();
  const { assignedId } = useParams();
  const [deliveryData, setDeliveryData] = useState(null);
  const [distanceWeight, setDistanceWeight] = useState({
    distance: 0,
    weight: 0,
  });
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const loadDeliveryDetail = async () => {
      try {
        console.log("API 호출 시작:", assignedId);

        // 운송 상세 정보 조회 (기존 DTO들을 조합한 Map 사용)
        const data = await fetchDeliveryDetail(assignedId);

        // console.log("=== API 응답 데이터 ===");
        // console.log("전체 데이터:", data);

        // 새로운 응답 구조에서 데이터 추출
        const additionalInfo = data?.additionalInfo || {};
        const request = data?.request || {};
        const actualDelivery = data?.actualDelivery || {};
        const waypoints = data?.waypoints || [];

        // console.log("additionalInfo:", additionalInfo);
        // console.log("request:", request);
        // console.log("actualDelivery:", actualDelivery);
        // console.log("waypoints:", waypoints);
        // console.log("URL 파라미터 assignedId:", assignedId);

        setDeliveryData(data);
        setDistanceWeight({
          distance: actualDelivery.distance || 0,
          weight: actualDelivery.weight || 0,
        });
        setWaypoints(waypoints.map((wp) => wp.address || wp.waypointId));
      } catch (err) {
        // console.error("운송 상세 정보 로드 실패:", err);
        // console.error("오류 상세:", err.response?.data || err.message);
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

  const formatTime = (dateString) => {
    return dayjs(dateString).format("HH:mm");
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
    backgroundColor: theme.palette.background.paper,
    "& .MuiTableCell-root": {
      borderBottom: `1px solid ${theme.palette.primary.light}`,
      borderRight: "none",
    },
  };

  const handleIconClick = () => {
    navigate("/admin/Support/Policy/PolicyPage");
  };

  if (loading) {
    return (
      <Box
        sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}
      >
        <Header />
        <LoadingComponent />
        <Footer />

      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}
      >
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!deliveryData) {
    return (
      <Box
        sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}
      >
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Alert severity="warning">운송 데이터를 찾을 수 없습니다.</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  // ✅ 경로 정보 구성 - 올바른 데이터 구조 사용
  const buildRouteInfo = () => {
    const info = [];

    // 1. 상차지 (시작점)
    const startAddress =
      deliveryData.request?.startAddress ||
      deliveryData.additionalInfo?.startAddress ||
      "상차지 정보 없음";
    const startTime = formatTime(
      deliveryData.assignment?.assignedAt ||
      deliveryData.additionalInfo?.assignedAt
    );

    info.push({
      location: startAddress,
      time: startTime,
      status: "completed", // 상차 완료
    });

    // 2. 경유지들 (중간점들) - dropOrder 순서대로
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((waypoint, index) => {
        info.push({
          location: waypoint || `경유지 ${index + 1}`,
          time: "시간 미정",
          status: "waypoint", // 경유지
          waypointNumber: index + 1,
        });
      });
    }

    // 3. 하차지 (도착점)
    const endAddress =
      deliveryData.request?.endAddress ||
      deliveryData.additionalInfo?.endAddress ||
      "하차지 정보 없음";
    const endTime = formatTime(
      deliveryData.assignment?.completedAt ||
      deliveryData.additionalInfo?.completedAt
    );

    info.push({
      location: endAddress,
      time: endTime,
      status: "completed", // 하차 완료
    });

    console.log("=== 구성된 routeInfo ===");
    console.log("routeInfo:", info);
    console.log(
      "locations for map:",
      info.map((r) => r.location)
    );

    return info;
  };

  const routeInfo = buildRouteInfo();

  // 타임라인 아이템 렌더링 함수
  const renderTimelineItem = (item, index) => {
    const isCompleted = item.status === "completed";
    const isWaypoint = item.status === "waypoint";

    let label = "";
    if (index === 0) {
      label = "상차 완료";
    } else if (index === routeInfo.length - 1) {
      label = "하차 완료";
    } else {
      label = `경유지 ${item.waypointNumber}`;
    }

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mb: 1.8,
          position: "relative",
        }}
      >
        {/* 왼쪽: 마커와 연결선 영역 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mr: 2,
            position: "relative",
            width: 40,
          }}
        >
          {/* 마커 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              ...(isCompleted
                ? {
                  bgcolor: thisTheme.palette.success.main,
                  color: "white",
                }
                : {
                  bgcolor: thisTheme.palette.text.secondary,
                  color: "white",
                }),
              zIndex: 2,
              position: "relative",
            }}
          >
            {isCompleted ? (
              <CheckIcon sx={{ fontSize: 20, color: "white" }} />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: "0.9rem",
                }}
              >
                {item.waypointNumber}
              </Typography>
            )}
          </Box>

          {/* 연결선 (마지막 아이템이 아닌 경우) */}
          {index < routeInfo.length - 1 && (
            <Box
              sx={{
                width: 2,
                height: 45,
                bgcolor: thisTheme.palette.text.secondary,
                position: "absolute",
                top: 40,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
              }}
            />
          )}
        </Box>

        {/* 내용과 시간 영역 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mt: 0.2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {/* 상단: 제목과 시간을 한 줄에 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.8,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  color: "#2A2A2A",
                  fontSize: "1rem",
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  color: "#2A2A2A",
                  fontSize: "1rem",
                }}
              >
                {item.time}
              </Typography>
            </Box>

            {/* 하단: 주소 박스 */}
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 1,
                px: 1.5,
                py: 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #E8E8E8",
                width: "fit-content",
                minWidth: "180px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#333",
                  lineHeight: 1.3,
                  fontSize: "0.875rem",
                }}
              >
                {item.location}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}>
      <Header />
      <LoadingComponent open={loading} text={`운송 번호 #${assignedId}의 상세내역을 불러오는 중...`}/>
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          {/* 운송 번호 헤더 */}
          <Box
            sx={{
              borderBottom: `1px solid ${thisTheme.palette.primary.main}`,
              pb: 2,
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color={thisTheme.palette.text.primary}
            >
              운송 번호 # {assignedId}
            </Typography>
          </Box>

          {/* 메인 콘텐츠 영역 */}
          <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
            {/* 왼쪽: 운송 단계 타임라인 */}
            <Box sx={{ width: "45%" }}>
              {/* 타임라인 */}
              <Box>
                {routeInfo.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 2.5,
                      position: "relative",
                    }}
                  >
                    {/* 왼쪽: 마커와 연결선 영역 */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mr: 2.5,
                        position: "relative",
                        width: 40,
                      }}
                    >
                      {/* 마커 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor:
                            item.status === "completed" ? thisTheme.palette.success.main : thisTheme.palette.text.secondary,
                          color: "white",
                          zIndex: 2,
                          position: "relative",
                        }}
                      >
                        {item.status === "completed" ? (
                          <CheckIcon sx={{ fontSize: 20, color: "white" }} />
                        ) : (
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color: "white",
                              fontSize: "0.9rem",
                            }}
                          >
                            {item.waypointNumber}
                          </Typography>
                        )}
                      </Box>

                      {/* 연결선 */}
                      {index < routeInfo.length - 1 ? (
                        <Box
                          sx={{
                            width: 3,
                            height: 80,
                            bgcolor: lighten(thisTheme.palette.text.secondary, 0.1),
                            position: "absolute",
                            top: 40,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1,
                          }}
                        />
                      ) : (
                        // 마지막 아이템에도 긴 선 추가
                        <Box
                          sx={{
                            width: 3,
                            height: 60,
                            bgcolor: lighten(thisTheme.palette.text.secondary, 0.1),
                            position: "absolute",
                            top: 40,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1,
                          }}
                        />
                      )}
                    </Box>

                    {/* 내용과 시간 영역 */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        {/* 상단: 제목과 시간을 한 줄에 */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color: thisTheme.palette.text.primary,
                              fontSize: "1.1rem",
                            }}
                          >
                            {index === 0
                              ? "상차 완료"
                              : index === routeInfo.length - 1
                                ? "하차 완료"
                                : `경유지 ${item.waypointNumber}`}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "normal",
                              color:
                                item.status === "completed"
                                  ? thisTheme.palette.success.main
                                  : thisTheme.palette.text.secondary,
                              fontSize: "0.9rem",
                            }}
                          >
                            {item.time}
                          </Typography>
                        </Box>

                        {/* 하단: 주소 박스 */}
                        <Box
                          sx={{
                            bgcolor: thisTheme.palette.background.paper,
                            borderRadius: 1,
                            px: 2,
                            py: 1.5,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            border: `1px solid${thisTheme.palette.text.secondary}`,
                            width: "100%",
                            maxWidth: "420px",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              color: thisTheme.palette.text.primary,
                              lineHeight: 1.4,
                              fontSize: "0.95rem",
                            }}
                          >
                            {item.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 오른쪽: 지도 영역 */}
            <Box sx={{ width: "55%" }}>
              {/* 지도 */}
              <Box
                sx={{
                  height: 500,
                  border: `0.6px solid ${thisTheme.palette.primary.main}`,
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: thisTheme.palette.background.paper,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  mb: 2,
                }}
              >
                {window.kakao && window.kakao.maps ? (
                  <PolylineMapComponent
                    polyline={deliveryData.actualDelivery.actualPolyline}
                    waypoints={waypoints}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      bgcolor: thisTheme.palette.background.paper,
                    }}
                  >
                    <Typography>지도를 불러오는 중...</Typography>
                  </Box>
                )}
              </Box>

              {/* 지도 하단 안내 텍스트 */}
              <Typography
                variant="body2"
                sx={{
                  color: thisTheme.palette.text.secondary,
                  fontSize: "0.875rem",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                지도를 확대하거나 축소해서 경로를 확인해보세요.
              </Typography>
            </Box>
          </Box>

          {/* 정산 내역 */}
          <Paper
            elevation={0}
            sx={{
              mt: 6,
              mb: 4,
              border: `1px solid ${thisTheme.palette.text.secondary}`,
              borderRadius: 2,
              bgcolor: thisTheme.palette.background.paper,
            }}
          >
            <Box sx={{ p: 3 }}>
              {(() => {
                // 실제 데이터에서 값 추출
                const actualDelivery = deliveryData?.actualDelivery || {};
                const request = deliveryData?.request || {};
                const assignment = deliveryData?.assignment || {};
                const waypoints = deliveryData?.waypoints || [];

                // 실제 데이터 기반 계산
                const baseFee = 100000; // 기본요금
                const distance = actualDelivery.distance || 0;
                const weight = actualDelivery.weight || 0;
                const distanceFee = Math.floor(distance / 1000) * 3000;
                const weightFee = Math.ceil(weight / 1000) * 30000;
                const waypointFee = waypoints.length * 50000;
                const mountainousFee = actualDelivery.mountainous ? 50000 : 0;
                const cautionFee = actualDelivery.caution ? 50000 : 0;
                const totalFee =
                  baseFee +
                  distanceFee +
                  weightFee +
                  waypointFee +
                  mountainousFee +
                  cautionFee;

                return (
                  <Box>
                    {/* 정산 내역 헤더 */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={thisTheme.palette.text.primary}
                      >
                        정산 내역
                      </Typography>
                    </Box>

                    {/* 구분선 */}
                    <Box
                      sx={{
                        borderBottom: `1px solid ${thisTheme.palette.primary.main}`,
                        mb: 3,
                      }}
                    />

                    <Box sx={{ pl: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          ㄴ 기본 요금
                        </Typography>
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          {formatPrice(baseFee)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          ㄴ 거리별 요금
                        </Typography>
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          {formatPrice(distanceFee)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          ㄴ 무게별 요금
                        </Typography>
                        <Typography
                          variant="body1"
                          color={thisTheme.palette.text.primary}
                        >
                          {formatPrice(weightFee)}
                        </Typography>
                      </Box>

                      {waypointFee > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            ㄴ 경유지 요금
                          </Typography>
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            {formatPrice(waypointFee)}
                          </Typography>
                        </Box>
                      )}

                      {mountainousFee > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            ㄴ 산간지역 요금
                          </Typography>
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            {formatPrice(mountainousFee)}
                          </Typography>
                        </Box>
                      )}

                      {cautionFee > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            ㄴ 취급주의 요금
                          </Typography>
                          <Typography
                            variant="body1"
                            color={thisTheme.palette.text.primary}
                          >
                            {formatPrice(cautionFee)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* 총 운송료 */}
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={thisTheme.palette.primary.main}
                        >
                          총 운송료
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={thisTheme.palette.primary.main}
                        >
                          {formatPrice(totalFee)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </Paper>

          {/* 목록으로 버튼 */}
          <Box display="flex" justifyContent="center" mt={6}>
            <Button
              variant="contained"
              sx={{
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
              }}
              onClick={() => navigate("/driver/deliveredlist")}
            >
              목록으로
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default DeliveredDetail;
