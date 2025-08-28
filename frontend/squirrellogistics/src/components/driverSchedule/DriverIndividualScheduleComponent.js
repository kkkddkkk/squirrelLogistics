import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { renderWarningTags } from "../../components/deliveryRequest/deliveryFormatUtil";
import DeliveryWaypointPopupComponent from "../../components/deliveryRequest/DeliveryWaypointPopupComponent";

import LoadingComponent from '../../components/common/LoadingComponent';
import { fetchDeliveryHistoryById } from "../../api/deliveryRequest/deliveryAssignmentAPI";

const DriverIndividualScheduleComponent = () => {
    const { scheduleId } = useParams();
    const [loading, setLoading] = useState(false);
    const [waypointOpen, setWaypointOpen] = useState(false);
    const [history, setHistory] = useState(null);
    const [err, setErr] = useState(null);
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
    const handlingTagString = renderWarningTags(history?.waypoints);

    const handleSelectWaypointEvent = useCallback(() => {
        setWaypointOpen(true);
    }, []);

    const handleCloseWaypoinDialog = useCallback(() => {
        setWaypointOpen(false);
    }, []);

    useEffect(() => {
        const ctrl = new AbortController();

        setLoading(true);
        fetchDeliveryHistoryById(scheduleId, { signal: ctrl.signal })
            .then((data) => {
                console.log("API 응답:", data);
                setHistory(data);
            })
            .catch((e) => setErr(e?.response?.data || e.message))
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [scheduleId]);

    console.log("history json:", JSON.stringify(history, null, 2));

    return (

        <Box width={"100%"}>
            {loading && (
                <LoadingComponent open={loading} text="운송 일정 정보를 불러오는 중..." />
            )}
            {/* <Grid width={"100%"}
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
                    }}>완료 운송 내역
                </Typography>

                <Grid container m={4} mb={0} justifySelf="center" width={"80%"}>
                    <Paper variant="outlined" sx={{ p: 4, pt: 2, pb: 2, width: "100%", borderColor: "#bbc5d0", boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)', }}>
                        <Grid container spacing={2} direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                            <Grid item>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>요청 번호:</Box> #REQ-{deliveryData.requestId}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>요청자:</Box> {deliveryData.companyName}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ justifyItems: "center", pt: 0, width: "100%" }}>
                <Grid container spacing={1} direction="row" justifyContent={"space-between"} sx={{ width: "80%" }} mb={4}>

                    <Grid item sx={{ width: "65%" }}>
                        <Grid container spacing={2} direction="column" sx={{ width: "100%" }}>
                            <Paper variant="outlined"
                                sx={{
                                    width: "100%",
                                    height: 500,
                                    p: 1,
                                    border: '1px solid #2a2a2a5d',
                                    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 1.2,
                                }}>
                                <RouteMapComponent
                                    expectedRoute={deliveryData.expectedRoute}
                                    expectedPolyline={deliveryData.expectedPolyline}
                                    waypoints={deliveryData.waypoints}
                                />
                            </Paper>
                            <Grid item width={"100%"}>
                                <Box mt={2}>
                                    <Typography fontWeight="bold">안내 및 주의 사항</Typography>
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        {deliveryData.memoToDriver}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid container justifyContent="center" mt={4} width={"100%"}>
                            <Grid item>
                                <Button variant="contained" color="primary" size="large"
                                    sx={{
                                        minWidth: 'auto',
                                        height: '48px',
                                        width: '200px',
                                        padding: '2px 8px',
                                        fontSize: '18px',
                                        lineHeight: 1.2,
                                        bgcolor: '#2A2A2A'
                                    }}>
                                    예약 운송 취소하기
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item sx={{ width: "30%" }}>
                        <Grid container spacing={2} direction="column">

                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                                    <Typography fontWeight="bold" gutterBottom>
                                        경로 정보
                                    </Typography>
                                    <Typography variant="body2" mb={1}
                                        sx={textSx}
                                    ><strong>상차지:</strong> {deliveryData.startAddress}</Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}><strong>최종 하차지:</strong> {deliveryData.endAddress}</Typography>
                                    <Grid container justifyContent="space-between" direction="row">
                                        <Grid item>
                                            <Typography variant="body2" mb={1} sx={textSx}><strong>하차지 수: </strong>
                                                {(!deliveryData.waypoints || (deliveryData.waypoints.length - 1) === 0)
                                                    ? "하차지 없음"
                                                    : `${deliveryData.waypoints.length - 1}곳`}
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
                                                    }}><strong>하차지 정보</strong></Button>
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
                                        <strong>화물 총 수량:</strong> {deliveryData?.totalCargoCount ?? 0}박스
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>총 중량:</strong> {deliveryData?.totalCargoWeight ?? 0}kg
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>필요 차종:</strong> {deliveryData?.vehicleTypeName ?? "지정된 차종 없음"}                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>특수 태그:</strong>{" "}
                                        <Typography component="span" color="primary" sx={{ fontSize: 'clamp(10px, 1vw, 12px)' }}>
                                            {handlingTagString}
                                        </Typography>
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                                    <Typography fontWeight="bold" gutterBottom>
                                        요청 시간
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>출발:</strong> {fmtDateTime(deliveryData?.wantToStart)}
                                    </Typography>
                                    <Typography variant="body2" mb={1} sx={textSx}>
                                        <strong>도착:</strong> {fmtDateTime(deliveryData?.wantToEnd)}
                                    </Typography>
                                    <Typography variant="body2" sx={textSx}>
                                        <strong>등록일:</strong> {fmtDateTime(deliveryData?.createAt)}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: "#bbc5d0" }}>
                                    <Typography fontWeight="bold" gutterBottom>
                                        운송 수익 정보
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        sx={textSx}
                                    >
                                        <strong>예상 수익:</strong> {formatWon(deliveryData?.estimatedFee)} (VAT 별도)
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
            )} */}
        </Box>

    );
}
export default DriverIndividualScheduleComponent;