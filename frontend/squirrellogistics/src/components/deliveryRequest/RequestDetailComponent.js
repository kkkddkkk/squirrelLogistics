import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useCallback, useEffect, useState } from "react";
import { renderWarningTags } from "./deliveryFormatUtil";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  acceptDeliveryRequest,
  fetchDeliveryRequest,
  msg,
} from "../../api/deliveryRequest/deliveryRequestAPI";
import MontlyDetailPopupComponent from "../driverSchedule/MontlyDetailPopupComponent";
import DeliveryWaypointPopupComponent from "./DeliveryWaypointPopupComponent";
import { formatRemaining } from "./DriverProposalComponent";
import {
  acceptDeliveryProposal,
  declineDeliveryProposal,
} from "../../api/deliveryRequest/deliveryProposalAPI";
import TwoButtonPopupComponent from "./TwoButtonPopupComponent";
import OneButtonPopupComponent from "./OneButtonPopupComponent";

import LoadingComponent from "../common/LoadingComponent";
import { theme } from "../common/CommonTheme";
import { CommonTitle } from "../common/CommonText";
import { cancelDeliveryReservation } from "../../api/deliveryRequest/deliveryAssignmentAPI";

const RequestDetailComponent = () => {
  const navigate = useNavigate();
  const { requestId, driverId } = useParams();

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [errKind, setErrKind] = useState(null);

  const [waypointOpen, setWaypointOpen] = useState(false);
  const location = useLocation();
  const { isProposed = false, refundDate } = location.state ?? {};
  const [proposed, setProposed] = useState(!!isProposed);
  const { isSchedule, ...rest } = location.state || {};
  const [scheduled, setScheduled] = useState(!!isSchedule);

  const [pathMoveOpen, setPathMoveOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupContent, setPopupContent] = useState("");
  const [errpopupOpen, setErrpopupOpen] = useState(false);
  const unautorized = false;

  const [deliveryData, setDeliveryData] = useState({
    request_id: null,
    estimated_fee: 0,
    total_cargo_count: 0,
    total_cargo_weight: 0,
    created_at: null,
    estimated_start_at: null,
    estimated_end_at: null,
    start_address: "",
    company_id: null,
    company_name: "",
    end_address: "",
    distance: 0,
    waypoints: [],
  });

  useEffect(() => {
    if (!requestId) return;

    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    fetchDeliveryRequest(requestId, driverId, { signal: controller.signal })
      .then((data) => {
        setRequestData(data);
      })
      .catch((e) => {
        const errBody = e.response?.data;
        setErr(errBody?.message ?? e.message);
        setErrpopupOpen(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [requestId]);

  // requestData → deliveryData 매핑
  useEffect(() => {
    if (!requestData) return;
    console.log(requestData);

    const mapped = {
      request_id: requestData.requestId,
      estimated_fee: requestData.estimatedFee,
      total_cargo_count: requestData.totalCargoCount,
      total_cargo_weight: requestData.totalCargoWeight,
      created_at: requestData.createAt,
      vehicle_type_name: requestData.vehicleTypeName,
      estimated_start_at: requestData.wantToStart,
      estimated_end_at: requestData.wantToEnd,
      company_id: requestData.companyId,
      company_name: requestData.companyName,
      start_address: requestData.startAddress,
      end_address: requestData.endAddress,
      polyline: requestData.expectedPolyline,
      routes: requestData.expectedRoute,
      distance: requestData.distance ?? 0,
      memo_to_driver: requestData.memoToDriver,
      waypoints: (requestData.waypoints ?? []).map((wp) => ({
        address: wp.address,
        order: wp.dropOrder,
        arriveAt: wp.arriveAt,
        droppedAt: wp.droppedAt,
        status: wp.status,
        handlingId: wp.handlingId,
        handlingTags: wp.handlingTags,
      })),
    };

    setDeliveryData(mapped);
  }, [requestData]);

  const runWithLoading = async (fn) => {
    if (loading) return;
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWaypointEvent = useCallback(() => {
    setWaypointOpen(true);
  }, []);

  const handleCloseWaypoinDialog = useCallback(() => {
    setWaypointOpen(false);
  }, []);

  const handleClosePathMoveDialog = useCallback(() => {
    setPathMoveOpen(false);
  }, []);

  async function handleAccept() {
    await runWithLoading(async () => {
      const call = isProposed ? acceptDeliveryProposal : acceptDeliveryRequest;
      const result = await call(requestId /*, driverId 필요없으면 제거 */, driverId);

      if (result.ok) {
        setPopupTitle(isProposed ? "지명 요청 수락" : "운송 요청 수락");
        setPopupContent(msg(result.code)); // SUCCESS / ALREADY_ACCEPTED
        setPathMoveOpen(true);
      } else {
        // 실패 케이스
        setErr(msg(result.code));           
        setErrKind(result.httpStatus >= 500 ? "server" : "forbidden");
        setErrpopupOpen(true);
      }
    });
  }


  async function handleDecline() {
    await runWithLoading(async () => {
      const res = await declineDeliveryProposal(requestId, driverId);
      if (res.SUCCESS) {

        setProposed(false);
        setErr("기사님께 제안된 운송 요청이 성공적으로 거절되었습니다.");
        setErrKind('decline');
        setErrpopupOpen(true);

      } else if (res.FAILED) {
        setErr(res.FAILED);
        setErrKind('forbidden');
        setErrpopupOpen(true);
      }
    });
  }
  async function handleCancel() {
    // 3일 미만 체크 먼저(로딩 시작 전에)
    if (isWithin3Days()) {
      setErr("시작일까지 남은 기일이 3일 미만인 예약은 취소할 수 없습니다.");
      setErrpopupOpen(true);
      return;
    }

    await runWithLoading(async () => {
      const res = await cancelDeliveryReservation(requestId);
      if (res?.SUCCESS || res === 1 || res === true) {
        setProposed(false);
        setPopupTitle("예약 취소 완료");
        setPopupContent("예약된 기사님 운송 일정이 성공적으로 취소되었습니다.");
        setPathMoveOpen(true);
        setScheduled(false); // 화면 상태 반영(선택)
      } else if (res?.FAILED) {
        setErr(res.FAILED);
        setErrpopupOpen(true);
      } else {
        setErr("처리 결과를 해석할 수 없습니다.");
        setErrpopupOpen(true);
      }
    });
  }

  const isWithin3Days = () => {
    const start = deliveryData?.estimated_start_at;
    if (!start) return false;
    const startDt = new Date(String(start).replace(" ", "T"));
    const diffDays = (startDt - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays < 3;
  };
  const textSx = {
    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
    color: "#2A2A2A",
    fontSize: "clamp(12px, 1vw, 14px)",
  };

  const fmtDateTime = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return isNaN(dt)
      ? "-"
      : dt.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
  };

  const formatWon = (n) => (Number(n) || 0).toLocaleString("ko-KR") + "원";
  const handlingTagString = renderWarningTags(deliveryData?.waypoints);

  return (
    <Box width={"100%"}>
      {err && (
        <OneButtonPopupComponent
          open={errpopupOpen}
          onClick={() => {
            setErrpopupOpen(false);
            // 클릭 후 이동 분기
            if (errKind === "forbidden") {
              navigate("/");
            } else if (errKind === "decline") {
              navigate("/driver/list");
            }
            // 상태 초기화
            setErr(null);
            setErrKind(null);
          }}
          title={
            errKind === "forbidden"
              ? "올바르지 않은 접근"
              : errKind === "decline"
                ? "지명 요청 거절"
                : "안내"
          }
          content={
            <>
              {String(err)}
              {errKind === "forbidden" && (
                <>
                  <br />
                  [확인] 클릭 시, 메인 화면으로 이동합니다.
                </>
              )}
              {errKind === "decline" && (
                <>
                  <br />
                  [확인] 클릭 시, 목록으로 이동합니다.
                </>
              )}
              {!errKind && (
                <>
                  <br />
                  고객센터로 문의 주시길 바랍니다.
                </>
              )}
            </>
          }
        />
      )}
      <Grid
        width={"100%"}
        sx={{
          bgcolor: theme.palette.background.paper,
          minHeight: 190,
        }}
      >
        <Box pt={4}>
          <CommonTitle>{scheduled ? "예약된 운송 정보" : "운송 요청 정보"}</CommonTitle>
        </Box>

        <Grid container m={4} mb={1} justifySelf="center" width={"80%"}>
          {proposed && (
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                pr: 4,
                pl: 4,
                width: "100%",
                bgcolor: "#113F67",
                mb: 1,
                borderColor: "#bbc5d0",
                boxShadow: "0px 5px 5px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                sx={{ width: "100%" }}
              >
                <Grid item>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                      color: "#e3effcff",
                      fontSize: "clamp(12px, 1.5vw, 14px)",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ color: "#ff2121ff", fontWeight: 700, mr: 1 }}
                    >
                      [알림]
                    </Box>{" "}
                    기사님께 지명된 운송 요청입니다.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                      color: "#e3effcff",
                      fontSize: "clamp(12px, 1.5vw, 14px)",
                    }}
                  >
                    {formatRemaining(refundDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 4,
              pt: 2,
              pb: 2,
              width: "100%",
              borderColor: "#bbc5d0",
              boxShadow: "0px 5px 5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              <Grid item>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    color: "#2A2A2A",
                    fontSize: "clamp(12px, 1.5vw, 18px)",
                  }}
                >
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    요청 번호:
                  </Box>{" "}
                  #REQ-{deliveryData.request_id}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    color: "#2A2A2A",
                    fontSize: "clamp(12px, 1.5vw, 18px)",
                  }}
                >
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    요청자:
                  </Box>{" "}
                  {deliveryData.company_name}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ justifyItems: "center", pt: 0, width: "100%" }}>
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent={"space-between"}
          sx={{ width: "80%" }}
          mb={4}
        >
          <Grid
            container
            sx={{
              direction: "column",
              width: "65%",
              justifyContent: "space-between",
            }}
          >
            <Grid item sx={{ width: "100%" }}>
              <Paper
                variant="outlined"
                sx={{
                  width: "100%",
                  height: 500,
                  p: 1,
                  border: "1px solid #2a2a2a5d",
                  boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.2,
                  borderColor: "#bbc5d0",
                }}
              >
                {/* 카카오 지도 컴포넌트 자리 */}
                <RouteMapComponent
                  expectedRoute={deliveryData.routes}
                  expectedPolyline={deliveryData.polyline}
                  waypoints={deliveryData.waypoints}
                />
              </Paper>
            </Grid>

            <Grid item width={"100%"}>
              <Box mt={2}>
                <Typography fontWeight="bold">안내 및 주의 사항</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {deliveryData.memo_to_driver}
                </Typography>
              </Box>
            </Grid>

            <Grid item width={"100%"}>
              <Grid
                container
                direction={"row"}
                justifyContent="space-around"
                mt={4}
                width={"100%"}
              >
                {scheduled ? (
                  // 1) 일정인 건: 취소 버튼만
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        minWidth: 'auto',
                        height: '48px',
                        padding: '2px 8px',
                        fontSize: '18px',
                        lineHeight: 1.2,
                        bgcolor: '#113F67',
                        p: 6, pt: 0, pb: 0,
                      }}
                    >
                      예약 취소하기
                    </Button>
                  </Grid>
                ) : (
                  // 2) 일정이 아닌 건: 기본 수락 버튼 + (proposed면) 거절 버튼 추가
                  <>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleAccept}
                        disabled={loading}
                        sx={{
                          minWidth: 'auto',
                          height: '48px',
                          padding: '2px 8px',
                          fontSize: '18px',
                          lineHeight: 1.2,
                          bgcolor: '#113F67',
                          p: 6, pt: 0, pb: 0,
                        }}
                      >
                        운송 수락하기
                      </Button>
                    </Grid>

                    {proposed && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleDecline}
                          disabled={loading}
                          sx={{
                            minWidth: 'auto',
                            height: '48px',
                            padding: '2px 8px',
                            fontSize: '18px',
                            lineHeight: 1.2,
                            bgcolor: '#671111ff',
                            p: 6, pt: 0, pb: 0,
                          }}
                        >
                          지명 거절하기
                        </Button>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* 정보 영역 */}
          <Grid item sx={{ width: "30%" }}>
            <Grid container spacing={2} direction="column">
              {/* 경로 정보 */}
              <Grid item>
                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                  <Typography fontWeight="bold" gutterBottom>
                    경로 정보
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>상차지:</strong> {deliveryData.start_address}
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>최종 하차지:</strong> {deliveryData.end_address}
                  </Typography>
                  <Grid
                    container
                    justifyContent="space-between"
                    direction="row"
                  >
                    <Grid item>
                      <Typography variant="body2" mb={1} sx={textSx}>
                        <strong>하차지 수: </strong>
                        {!deliveryData.waypoints ||
                          deliveryData.waypoints.length - 1 === 0
                          ? "하차지 없음"
                          : `${deliveryData.waypoints.length - 1}곳`}
                      </Typography>
                    </Grid>
                    {deliveryData.waypoints.length > 0 && (
                      <Grid>
                        <Button
                          variant="outlined"
                          onClick={handleSelectWaypointEvent}
                          sx={{
                            minWidth: "auto",
                            height: "24px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            lineHeight: 1.2,
                            color: "#113F67",
                            backgroundColor: "white",
                            borderColor: "#113F67",
                          }}
                        >
                          <strong>하차지 정보</strong>
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>총 이동 거리:</strong> 약{" "}
                    {(deliveryData.distance / 1000).toFixed(1)}km
                  </Typography>
                </Paper>
              </Grid>

              <Grid item>
                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                  <Typography fontWeight="bold" gutterBottom>
                    화물 정보
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>화물 총 수량:</strong>{" "}
                    {deliveryData?.total_cargo_count ?? 0}박스
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>총 중량:</strong>{" "}
                    {deliveryData?.total_cargo_weight ?? 0}kg
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>필요 차종:</strong>{" "}
                    {deliveryData?.vehicle_type_name ?? "지정된 차종 없음"}{" "}
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>특수 태그:</strong>{" "}
                    <Typography
                      component="span"
                      color="primary"
                      sx={{ fontSize: "clamp(10px, 1vw, 12px)" }}
                    >
                      {handlingTagString}
                    </Typography>
                  </Typography>
                </Paper>
              </Grid>

              {/* 요청 시간 */}
              <Grid item>
                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                  <Typography fontWeight="bold" gutterBottom>
                    요청 시간
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>출발:</strong>{" "}
                    {fmtDateTime(deliveryData?.estimated_start_at)}
                  </Typography>
                  <Typography variant="body2" mb={1} sx={textSx}>
                    <strong>도착:</strong>{" "}
                    {fmtDateTime(deliveryData?.estimated_end_at)}
                  </Typography>
                  <Typography variant="body2" sx={textSx}>
                    <strong>등록일:</strong>{" "}
                    {fmtDateTime(deliveryData?.created_at)}
                  </Typography>
                </Paper>
              </Grid>

              {/* 운송 수익 정보 */}
              <Grid item>
                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                  <Typography fontWeight="bold" gutterBottom>
                    운송 수익 정보
                  </Typography>
                  {/* <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>기본 운임:</strong> {formatWon(deliveryData.estimated_fee)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>경유지 가산금:</strong> {formatWon(30000)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>신선화물 가산금:</strong> {formatWon(20000)}
                                    </Typography> */}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" fontWeight="bold" sx={textSx}>
                    <strong>예상 수익:</strong>{" "}
                    {formatWon(deliveryData?.estimated_fee)} (VAT 별도)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {waypointOpen && (
        <DeliveryWaypointPopupComponent
          waypoints={deliveryData.waypoints}
          onClose={handleCloseWaypoinDialog}
          open={waypointOpen}
        />
      )}

      {pathMoveOpen && (
        <TwoButtonPopupComponent
          open={pathMoveOpen}
          leftTxt="목록으로 이동"
          rightTxt="캘린더로 이동"
          onLeftClick={() => navigate(`/driver/list`)}
          onRightClick={() => {
            const wantToStart = deliveryData?.estimated_start_at;
            console.log(deliveryData?.estimated_start_at);
            if (!wantToStart) {
              return;
            }
            const startDate = new Date(wantToStart.replace(" ", "T"));
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            navigate(`/driver/calendar/${year}/${month}`);
          }}

          title={popupTitle}
          content={popupContent}
        />
      )}
      <LoadingComponent open={loading} text="상세 정보를 불러오는 중..." />
    </Box>
  );
};
export default RequestDetailComponent;
