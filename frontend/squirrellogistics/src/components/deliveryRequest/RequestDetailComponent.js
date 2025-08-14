
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useCallback, useEffect, useState } from "react";
import { renderWarningTags } from "./deliveryFormatUtil";
import { useParams } from "react-router-dom";
import { fetchDeliveryRequest } from "../../api/deliveryRequest/deliveryRequestAPI";
import MontlyDetailPopupComponent from "../driverSchedule/MontlyDetailPopupComponent";
import DeliveryWaypointPopupComponent from "./DeliveryWaypointPopupComponent";

const RequestDetailComponent = () => {

    const { requestId } = useParams();
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
        duration: 0,
        waypoints: [],
    });

    useEffect(() => {
        if (!requestId) return;

        const controller = new AbortController();
        setLoading(true);
        setErr(null);

        fetchDeliveryRequest(requestId, { signal: controller.signal })
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
            duration: 0,
            waypoints: (requestData.waypoints ?? []).map(wp => ({
                address: wp.address,
                order: wp.dropOrder,
                arriveAt: wp.arriveAt,
                droppedAt: wp.droppedAt,
                status: wp.status,
            })),
        };

        setDeliveryData(mapped);
    }, [requestData]);

    const handleSelectEvent = useCallback(() => {
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);

    const handleRouteUpdate = (dist, dur) => {

        setDeliveryData(prev => ({
            ...prev,
            distance: dist,
            duration: dur
        }));
    };

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

                <Grid container m={4} mb={0} justifySelf="center" width={"80%"}>
                    <Paper variant="outlined" sx={{ p: 6, pt: 2, pb: 2, width: "100%", borderColor: "#bbc5d0", boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)', }}>
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
                                    onRouteUpdate={handleRouteUpdate}
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
                                <Grid item>
                                    <Button variant="contained" color="primary" size="large"
                                        sx={{
                                            minWidth: 'auto',
                                            height: '48px',
                                            width: '260px',
                                            padding: '2px 8px',
                                            fontSize: '18px',
                                            lineHeight: 1.2,
                                            bgcolor: '#113F67'
                                        }}>
                                        운송 수락하기
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="primary" size="large"
                                        sx={{
                                            minWidth: 'auto',
                                            height: '48px',
                                            width: '160px',
                                            padding: '2px 8px',
                                            fontSize: '18px',
                                            lineHeight: 1.2,
                                            bgcolor: '#2A2A2A'
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
                                            <Typography variant="body2" mb={1} sx={textSx}><strong>경유지 수:</strong> {deliveryData.waypoints.length}곳</Typography>
                                        </Grid>
                                        <Grid>
                                            <Button variant="outlined"
                                                onClick={handleSelectEvent}
                                                sx={{
                                                    minWidth: 'auto',
                                                    height: '24px',
                                                    padding: '2px 8px',
                                                    fontSize: '11px',
                                                    lineHeight: 1.2, color: "#113F67", backgroundColor: "white", borderColor: "#113F67"
                                                }}><strong>경유지 정보</strong></Button>
                                        </Grid>
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
                                        <strong>필요 차종:</strong> {deliveryData?.vehicle_type_name}
                                    </Typography>
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

            {dialogOpen && (
                <DeliveryWaypointPopupComponent
                    waypoints={deliveryData.waypoints}
                    onClose={handleCloseDialog}
                    open={dialogOpen}
                />
            )}

        </Box>

    );


}
export default RequestDetailComponent;