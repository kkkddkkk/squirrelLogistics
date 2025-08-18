
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider, Alert, Snackbar } from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useCallback, useEffect, useState } from "react";
import { renderWarningTags } from "./deliveryFormatUtil";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { acceptDeliveryRequest, fetchDeliveryRequest } from "../../api/deliveryRequest/deliveryRequestAPI";
import MontlyDetailPopupComponent from "../driverSchedule/MontlyDetailPopupComponent";
import DeliveryWaypointPopupComponent from "./DeliveryWaypointPopupComponent";
import { formatRemaining } from "./DriverProposalComponent";
import { acceptDeliveryProposal, declineDeliveryProposal } from "../../api/deliveryRequest/deliveryProposalAPI";
import TwoButtonPopupComponent from "./TwoButtonPopupComponent";

const RequestDetailComponent = () => {
    const navigate = useNavigate();
    const { requestId, driverId } = useParams();

    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [waypointOpen, setWaypointOpen] = useState(false);
    const location = useLocation();
    const { isProposed = false, refundDate } = location.state ?? {};
    const [proposed, setProposed] = useState(!!isProposed);
    const [pathMoveOpen, setPathMoveOpen] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupContent, setPopupContent] = useState('');

    const [deliveryData, setDeliveryData] = useState({
        request_id: null,
        estimated_fee: 0,
        total_cargo_count: 0,
        total_cargo_weight: 0,
        created_at: null,
        estimated_start_at: null,
        estimated_end_at: null,
        start_address: '',
        company_id: null,
        company_name: '',
        end_address: '',
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
                if (e.name === 'CanceledError' || e.name === 'AbortError') return;
                setErr(e?.response?.data || e.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [requestId]);

    // requestData → deliveryData 매핑
    useEffect(() => {
        if (!requestData) return;

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
            waypoints: (requestData.waypoints ?? []).map(wp => ({
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
        try {
            if (isProposed) {
                const res = await acceptDeliveryProposal(requestId, driverId);
                if (res.SUCCESS) {
                    setPopupTitle('지명 요청 수락');
                    setPopupContent('기사님께 제안된 운송 요청이 성공적으로 수락되었습니다.');
                    setPathMoveOpen(true);
                } else if (res.FAILED) {
                    alert("실패: " + res.FAILED);
                }
            } else {
                const res = await acceptDeliveryRequest(requestId, driverId);
                if (res.SUCCESS) {
                    setPopupTitle("운송 요청 수락");
                    setPopupContent("운송 요청이 성공적으로 수락되었습니다.");
                    
                    setPathMoveOpen(true);
                } else if (res.FAILED) {
                    alert("실패: " + res.FAILED);
                }
            }

        } catch (err) {
            const status = err.response?.status;
            const body = err.response?.data;

            // 우리 컨트롤러 포맷 우선
            const code = body?.FAILED || body?.code || body?.error || 'UNKNOWN';

            // 코드 → 사용자 문구 매핑
            const messages = {
                REQUEST_NOT_FOUND: '요청을 찾을 수 없어요.',
                DRIVER_NOT_FOUND: '기사를 찾을 수 없어요.',
                REQUEST_ALREADY_TAKEN: '이미 다른 기사에게 배정됐어요.',
                VEHICLE_TYPE_MISMATCH: '요청 차량과 보유 차량이 일치하지 않아요.',
                SCHEDULE_CONFLICT: '해당 기간에 이미 일정이 있어요.',
                UNKNOWN: `처리 실패 (status ${status})`,
            };

            alert("에러: " + messages[code]);

        }
    }

    async function handleDecline() {
        try {
            const res = await declineDeliveryProposal(requestId, driverId);
            if (res.SUCCESS) {
                setProposed(false);
                setPathMoveOpen(true);
                setPopupTitle("지명 요청 거절");
                setPopupContent("기사님께 제안된 운송 요청이 성공적으로 거절되었습니다.");
            } else if (res.FAILED) {
                alert("실패: " + res.FAILED);
            }
        } catch (err) {
            const body = err.response?.data;
            const code = body?.FAILED || body?.code || body?.error || 'UNKNOWN';

            alert("FAILED: " + code);
        }
    }

    const textSx = {
        fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif',
        color: '#2A2A2A',
        fontSize: 'clamp(12px, 1vw, 14px)',
    };

    const fmtDateTime = (d) => {
        const dt = d instanceof Date ? d : new Date(d);
        return isNaN(dt) ? '-' : dt.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatWon = (n) => (Number(n) || 0).toLocaleString('ko-KR') + '원';
    const handlingTagString = renderWarningTags(deliveryData?.waypoints);

    console.log(deliveryData);
    return (

        <Box width={"100%"}>
            <Grid width={"100%"}
                sx={{
                    background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    minHeight: 190
                }}
            >
                <Typography variant="h4" align="center" pt={4} gutterBottom
                    sx={{
                        fontFamily: 'inherit', fontSize: '2.0rem',
                        fontWeight: 'bold',
                        color: '#2A2A2A',
                        margin: 0
                    }}>요청 정보
                </Typography>

                <Grid container m={4} mb={1} justifySelf="center" width={"80%"}>
                    {isProposed &&
                        <Paper variant="outlined" sx={{ p: 1, pr: 4, pl: 4, width: "100%", bgcolor: '#113F67', mb: 1, borderColor: "#bbc5d0", boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)', }}>

                            <Grid container spacing={2} direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                                <Grid item>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#e3effcff', fontSize: 'clamp(12px, 1.5vw, 14px)' }}
                                    >
                                        운전자님께 지명된 운송 요청입니다.
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#e3effcff', fontSize: 'clamp(12px, 1.5vw, 14px)' }}
                                    >
                                        {formatRemaining(refundDate)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    }


                    <Paper variant="outlined" sx={{ p: 4, pt: 2, pb: 2, width: "100%", borderColor: "#bbc5d0", boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)', }}>
                        <Grid container spacing={2} direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                            <Grid item>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>요청 번호:</Box> #REQ-{deliveryData.request_id}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>요청자:</Box> {deliveryData.company_name}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ justifyItems: "center", pt: 0, width: "100%" }}>
                <Grid container spacing={1} direction="row" justifyContent={"space-between"} sx={{ width: "80%" }} mb={4}>

                    <Grid container sx={{ direction: "column", width: "65%", justifyContent: "space-between" }}>
                        <Grid item sx={{ width: "100%" }}>
                            <Paper variant="outlined"
                                sx={{
                                    width: "100%",
                                    height: 500,
                                    p: 1,
                                    border: '1px solid #2a2a2a5d',
                                    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 1.2,
                                    borderColor: "#bbc5d0"
                                }}>
                                {/* 카카오 지도 컴포넌트 자리 */}
                                <RouteMapComponent
                                    routes={deliveryData.routes}
                                    polyline={deliveryData.polyline}
                                    waypoints={deliveryData.waypoints}
                                />
                            </Paper>
                        </Grid>

                        <Grid item width={"100%"}>
                            <Box mt={2}>
                                <Typography fontWeight="bold">안내 및 주의 사항</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {deliveryData.memo_to_driver}
                                </Typography>
                            </Box>
                        </Grid>


                        <Grid item width={"100%"}>
                            <Grid container direction={"row"} justifyContent="space-between" mt={4} width={"100%"}>
                                <Grid item >
                                    <Button variant="contained" color="primary" size="large"
                                        onClick={handleAccept}
                                        sx={{
                                            minWidth: 'auto',
                                            height: '48px',
                                            padding: '2px 8px',
                                            fontSize: '18px',
                                            lineHeight: 1.2,
                                            bgcolor: '#113F67',
                                            p: 6,
                                            pt: 0,
                                            pb: 0
                                        }}>
                                        운송 수락하기
                                    </Button>

                                </Grid>
                                {isProposed &&
                                    <Grid item >
                                        <Button variant="contained" color="primary" size="large"
                                            onClick={handleDecline}
                                            sx={{
                                                minWidth: 'auto',
                                                height: '48px',
                                                padding: '2px 8px',
                                                fontSize: '18px',
                                                lineHeight: 1.2,
                                                bgcolor: '#671111ff',
                                                p: 6,
                                                pt: 0,
                                                pb: 0
                                            }}>
                                            지명 거절하기
                                        </Button>
                                    </Grid>
                                }


                                <Grid item >
                                    <Button variant="contained" color="primary" size="large"
                                        sx={{
                                            minWidth: 'auto',
                                            height: '48px',
                                            padding: '2px 8px',
                                            fontSize: '18px',
                                            lineHeight: 1.2,
                                            bgcolor: '#2A2A2A',
                                            p: 4,
                                            pt: 0,
                                            pb: 0
                                        }}>
                                        신고하기
                                    </Button>
                                </Grid>
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
                                    <Typography variant="body2" mb={1}
                                        sx={textSx}
                                    ><strong>출발지:</strong> {deliveryData.start_address}</Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}><strong>도착지:</strong> {deliveryData.end_address}</Typography>
                                    <Grid container justifyContent="space-between" direction="row">
                                        <Grid item>
                                            <Typography variant="body2" mb={1} sx={textSx}><strong>경유지 수: </strong>
                                                {(!deliveryData.waypoints || deliveryData.waypoints.length === 0)
                                                    ? "경유지 없음"
                                                    : `${deliveryData.waypoints.length}곳`}
                                            </Typography>
                                        </Grid>
                                        {deliveryData.waypoints.length > 0 &&
                                            <Grid>
                                                <Button variant="outlined"
                                                    onClick={handleSelectWaypointEvent}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        height: '24px',
                                                        padding: '2px 8px',
                                                        fontSize: '11px',
                                                        lineHeight: 1.2, color: "#113F67", backgroundColor: "white", borderColor: "#113F67"
                                                    }}><strong>경유지 정보</strong></Button>
                                            </Grid>
                                        }

                                    </Grid>
                                    <Typography variant="body2" mb={1} sx={textSx}><strong>총 이동 거리:</strong> 약 {(deliveryData.distance / 1000).toFixed(1)}km</Typography>
                                </Paper>
                            </Grid>

                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                                    <Typography fontWeight="bold" gutterBottom>
                                        화물 정보
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>화물 총 수량:</strong> {deliveryData?.total_cargo_count ?? 0}박스
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>총 중량:</strong> {deliveryData?.total_cargo_weight ?? 0}kg
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>필요 차종:</strong> {deliveryData?.vehicle_type_name ?? "지정된 차종 없음"}                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>특수 태그:</strong>{" "}
                                        <Typography component="span" color="primary" sx={{ fontSize: 'clamp(10px, 1vw, 12px)' }}>
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
                                        <strong>출발:</strong> {fmtDateTime(deliveryData?.estimated_start_at)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>도착:</strong> {fmtDateTime(deliveryData?.estimated_end_at)}
                                    </Typography>
                                    <Typography variant="body2" sx={textSx}>
                                        <strong>등록일:</strong> {fmtDateTime(deliveryData?.created_at)}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* 운송 수익 정보 */}
                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                                    <Typography fontWeight="bold" gutterBottom>
                                        운송 수익 정보
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>기본 운임:</strong> {formatWon(deliveryData.estimated_fee)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>경유지 가산금:</strong> {formatWon(30000)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>신선화물 가산금:</strong> {formatWon(20000)}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        sx={textSx}
                                    >
                                        <strong>총 수익:</strong> {formatWon(190000)} (VAT 별도)
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
                    onLeftClick={() => navigate(`/driver/${driverId}/list`)}
                    onRightClick={() => navigate(`/driver/${driverId}/calendar`)}
                    title={popupTitle}
                    children={popupContent}
                />
            )}

        </Box>

    );


}
export default RequestDetailComponent;