import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  Paper,
  useTheme,
  lighten,
  Grid,
  useMediaQuery,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDeliveryDetail } from "../../api/deliveryRequest/deliveryCompletedAPI";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";
import dayjs from "dayjs";
import PolylineMapComponent from "../../components/deliveryMap/PolylineMapComponent";

import { theme } from "../../components/common/CommonTheme";
import LoadingComponent from "../../components/common/LoadingComponent";

const DeliveredDetail = () => {
  const thisTheme = useTheme();
  const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const { assignedId } = useParams();
  const [deliveryData, setDeliveryData] = useState(null);
  const [distanceWeight, setDistanceWeight] = useState({
    distance: 0,
    weight: 0,
  });
  //const [waypoints, setWaypoints] = useState([]);
  const [mapAddresses, setMapAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assignedId) {
      setError("유효하지 않은 운송 번호입니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const loadDeliveryDetail = async () => {
      try {
        // 운송 상세 정보 조회 (기존 DTO들을 조합한 Map 사용)
        const data = await fetchDeliveryDetail(assignedId);

        // 새로운 응답 구조에서 데이터 추출
        const actualDelivery = data?.actualDelivery || {};
        const rawWaypoints = data?.waypoints || [];

        setDeliveryData(data);
        setDistanceWeight({
          distance: actualDelivery.distance || 0,
          weight: actualDelivery.weight || 0,
        });

        // 지도 표시용 주소 배열 (dropOrder 기준 정렬)
        const sortedWps = [...rawWaypoints].sort(
          (a, b) => (a?.waypoint?.dropOrder ?? 0) - (b?.waypoint?.dropOrder ?? 0)
        );
        setMapAddresses(sortedWps.map((w) => w?.waypoint?.address || ""));
      } catch (err) {
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
    const midStops = Math.max((waypoints?.length || 0) - 2, 0);

    const distance = actualDelivery.distance || 0;
    const kmUnits = Math.ceil(distance / 1000);

    const weight = actualDelivery.weight || 0;
    const tonUnits = Math.ceil(weight / 1000);

    const mountainous = actualDelivery.mountainous || false;
    const caution = actualDelivery.caution || false;

    // 기본요금 계산 (거리 × 무게 × 단가)
    const baseFee = 100000; // 기본요금 10만원

    // 거리별 요금 (1km당 3,000원)
    const distanceFee = kmUnits * 3000;

    // 무게별 요금 (1kg당 30,000원)
    const weightFee = tonUnits * 30000;

    // 경유지 요금 (경유지당 50,000원)
    const waypointFee = midStops * 50000;

    // 산간지역 요금
    const mountainousFee = mountainous ? 50000 : 0;

    // 취급주의 요금
    const cautionFee = caution ? 50000 : 0;

    // 총 요금
    const totalFee = baseFee + distanceFee + weightFee + waypointFee + mountainousFee + cautionFee;

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

  if (loading) {
    return (<LoadingComponent open text={`운송 번호 #${assignedId}의 상세내역을 불러오는 중...`} />);
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh", }}>
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
      <Box sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh", }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Alert severity="warning">운송 데이터를 찾을 수 없습니다.</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  const buildRouteInfo = () => {
    const wps = (deliveryData?.waypoints || [])
      .slice()
      .sort(
        (a, b) => (a?.waypoint?.dropOrder ?? 0) - (b?.waypoint?.dropOrder ?? 0)
      );

    if (wps.length === 0) return [];

    return wps.map((w, idx) => {
      const dropOrder = w?.waypoint?.dropOrder ?? idx; // 0=상차지, 1..=경유/하차지
      const isStart = idx === 0;
      const isEnd = idx === wps.length - 1;
      const isMiddle = !isStart && !isEnd;
      const timeStr = w?.droppedAtFromLog
        ? dayjs(w.droppedAtFromLog).format("YYYY/MM/DD HH:mm")
        : "-";
      return {
        label: isStart
          ? "상차 완료"
          : isEnd
            ? "하차 완료"
            : `경유지 ${dropOrder}`,
        location: w?.waypoint?.address || "-",
        time: timeStr,
        isStart,
        isEnd,
        isMiddle,
        markerNumber: isMiddle ? dropOrder : null,
        dropOrder,
        cargo: w?.cargo || null, // { description, handlingTags, ... } | null
      };
    });
  };

  const routeInfo = buildRouteInfo();
  const fees = calculateFees(deliveryData);

  const SpaceBetween = ({ children }) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
        }}
      >
        {children}
      </Box>
    );
  }

  const Body1 = ({ children }) => {
    return (
      <Typography
        variant="body1"
        color={thisTheme.palette.text.primary}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Box
      sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}
    >
      <Header />
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          {/* 운송 번호 헤더 */}
          <Grid
            container direction={"row"}
            justifyContent={"space-between"} alignContent={"end"}
            sx={{
              borderBottom: `1px solid ${thisTheme.palette.primary.main}`,
              pb: 2, mb: 4,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color={thisTheme.palette.text.primary}
            >
              운송 번호 # {assignedId}
            </Typography>

            <Typography
              variant="h6"
              color={thisTheme.palette.text.primary}
              lineHeight={"2"}
            >
              요청자: {deliveryData.request.companyName}
            </Typography>
          </Grid>

          {/* 메인 콘텐츠 영역 */}
          <Grid container gap={4} marginBottom={4}>
            <Grid size={isMobile?12:5}>
              {/* <Box> */}
              {routeInfo.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex", mb: 2.5,
                    position: "relative", alignItems: "stretch",
                    width: "100%"
                  }}
                >
                  {/* 왼쪽: 마커와 연결선 영역 */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      mr: 2.5, position: "relative", width: 40,
                      ...(index === routeInfo.length - 1
                        ? {} : {
                          "&::after": {
                            content: '""',
                            position: "absolute", transform: "translateX(-50%)",
                            left: "50%", top: 40, // 마커 원 아래
                            // 아이템 간 간격(mb: 2.5)만큼 더 내려서 다음 마커에 정확히 닿게
                            bottom: `-${thisTheme.spacing(2.5)}`,
                            width: 3,
                            backgroundColor: lighten(
                              thisTheme.palette.text.secondary,
                              0.7
                            ), zIndex: 1,
                          },
                        }),
                    }}>
                    {/* 마커 */}
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 40, height: 40,
                        borderRadius: "50%",
                        bgcolor: item.isMiddle
                          ? thisTheme.palette.text.secondary
                          : thisTheme.palette.success.main,
                        color: "white", zIndex: 2, position: "relative",
                      }}
                    >
                      {item.isMiddle ? (
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: "white",
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.markerNumber}
                        </Typography>
                      ) : (
                        <CheckIcon sx={{ fontSize: 20, color: "white" }} />
                      )}
                    </Box>

                    {/* 연결선 */}
                    {index < routeInfo.length - 1 ? (
                      <Box
                        sx={{
                          width: 3,
                          height: 80,
                          bgcolor: lighten(
                            thisTheme.palette.text.secondary,
                            0.1
                          ),
                          position: "absolute",
                          top: 40,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 1,
                        }}
                      />
                    ) : (
                      // 마지막 아이템에도 긴 선 추가
                      <Box sx={{
                        width: 3, height: 60,
                        bgcolor: lighten(thisTheme.palette.text.secondary, 0.7),
                        position: "absolute",
                        top: 40, left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1,
                      }}
                      />
                    )}
                  </Box>

                  {/* 내용과 시간 영역 */}
                  <Box sx={{
                    flex: 1,
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
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
                          {item.label}
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
                          border: `1px solid ${thisTheme.palette.text.secondary}`,
                          width: "100%",
                          maxWidth: "450px",
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
                        {!item.isStart && item.cargo && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: thisTheme.palette.text.secondary,
                              mt: 0.5,
                            }}
                          >
                            하차 화물: {item.cargo.description}
                            {item.cargo.handlingTags
                              ? ` · ${item.cargo.handlingTags}`
                              : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
              {/* </Box> */}
            </Grid>
            <Grid size={isMobile?12:6}>
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
                    waypoints={mapAddresses}
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
            </Grid>
          </Grid>
          {/* <Box sx={{ display: "flex", gap: 4, mb: 4 }}> */}
          {/* 왼쪽: 운송 단계 타임라인 */}
          {/* <Box sx={{ width: isMobile ? "100%" : "45%" }}> */}
          {/* 타임라인 */}
          {/* </Box> */}


          {/* 오른쪽: 지도 영역
            <Box sx={{ width: isMobile ? "100%" : "55%" }}>



            </Box> */}
          {/* </Box> */}

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
                const totalFee = baseFee + distanceFee + weightFee +
                  waypointFee + mountainousFee + cautionFee;

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
                      <SpaceBetween>
                        <Body1>ㄴ 기본 요금</Body1>
                        <Body1>{formatPrice(fees.baseFee)}</Body1>
                      </SpaceBetween>
                      <SpaceBetween>
                        <Body1>ㄴ 거리별 요금</Body1>
                        <Body1>{formatPrice(fees.distanceFee)}</Body1>
                      </SpaceBetween>
                      <SpaceBetween>
                        <Body1>ㄴ 무게별 요금</Body1>
                        <Body1>{formatPrice(fees.weightFee)}</Body1>
                      </SpaceBetween>

                      {waypointFee > 0 && (
                        <SpaceBetween>
                          <Body1>ㄴ 경유지 요금</Body1>
                          <Body1>{formatPrice(fees.waypointFee)}</Body1>
                        </SpaceBetween>
                      )}

                      {mountainousFee > 0 && (
                        <SpaceBetween>
                          <Body1>ㄴ 산간지역 요금</Body1>
                          <Body1>{formatPrice(fees.mountainousFee)}</Body1>
                        </SpaceBetween>
                      )}

                      {cautionFee > 0 && (
                        <SpaceBetween>
                          <Body1>ㄴ 취급주의 요금</Body1>
                          <Body1>{formatPrice(fees.cautionFee)}</Body1>
                        </SpaceBetween>
                      )}
                    </Box>

                    {/* 총 운송료 */}
                    <Box sx={{ mt: 3, pt: 2, }}>
                      <Box sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                      >
                        <Typography variant="h6" fontWeight="bold" color={thisTheme.palette.primary.main}>
                          총 운송료
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color={thisTheme.palette.primary.main}>
                          {formatPrice(fees.totalFee)}
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
