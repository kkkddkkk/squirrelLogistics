
import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useState } from "react";
const DriverIndividualScheduleComponent = ({ event }) => {
    console.log(event);
    const initData = {
        schedule_id: event.schedule_id,
        estimated_fee: event.estimated_fee,
        created_at: event.created_at,
        start_address: event.start_address,
        company_id: event.company_id,
        company_name: event.company_name,
        end_address: event.end_address,
        distance: event.distance,
        duration: 0, // 없던 필드 추가
        waypoints: event.waypoints.map(wp => ({
            ...wp, // handling_id 등 그대로 유지
            address: wp.address
        }))
    };

    const [deliveryData, setDeliveryData] = useState(initData);
    console.log(deliveryData);

    const handleRouteUpdate = (dist, dur) => {

        setDeliveryData(prev => ({
            ...prev,
            distance: dist,
            duration: dur
        }));
    };

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
                    }}>예약 운송 정보
                </Typography>

                <Grid container m={4} mb={0} justifySelf="center" width={"80%"}>
                    <Paper variant="outlined" sx={{ p: 6, pt: 2, pb: 2, width: "100%" }}>
                        <Grid container spacing={2} direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                            <Grid item>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>예약 번호:</Box> #RESV-{deliveryData.schedule_id}
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
                                {/* 카카오 지도 컴포넌트 자리 */}
                                <RouteMapComponent
                                    startAddress={deliveryData.start_address}
                                    waypoints={deliveryData.waypoints}
                                    endAddress={deliveryData.end_address}
                                    onRouteUpdate={handleRouteUpdate}
                                />
                            </Paper>
                            <Box mt={2}>
                                <Typography fontWeight="bold">안내 및 주의 사항</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    화물은 깨지기 쉬운 포장으로 되어 있어 상하차시 파손에 유의해주세요.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* 버튼 영역 */}
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

                    {/* 정보 영역 */}
                    <Grid item sx={{ width: "30%" }}>
                        <Grid container spacing={2} direction="column">

                            {/* 경로 정보 */}
                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography fontWeight="bold" gutterBottom mb={2}>
                                        경로 정보
                                    </Typography>
                                    <Typography variant="body2" mb={1}
                                        sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1vw, 14px)' }}
                                    >출발지: {deliveryData.start_address}</Typography>
                                    <Typography variant="body2" mb={1} sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1vw, 14px)' }}>도착지: {deliveryData.end_address}</Typography>
                                    <Grid container justifyContent="space-between" direction="row">
                                        <Grid item>
                                            <Typography variant="body2" mb={1} sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1vw, 14px)' }}>경유지 수: {deliveryData.waypoints.length}곳</Typography>
                                        </Grid>
                                        <Grid>
                                            <Button variant="outlined" size="small" mb={1}
                                                sx={{
                                                    minWidth: 'auto',
                                                    height: '24px',
                                                    padding: '2px 8px',
                                                    fontSize: '11px',
                                                    lineHeight: 1.2
                                                }}>경유지 보기</Button>
                                        </Grid>
                                    </Grid>
                                    <Typography variant="body2" mb={1} sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1vw, 14px)' }}>총 이동 거리: 약 {(deliveryData.distance / 1000).toFixed(1)}km</Typography>
                                    <Typography variant="body2" gutterBottom sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1vw, 14px)' }}>예상 소요 시간: 약 {Math.floor(deliveryData.duration / 3600)}시간 {Math.floor((deliveryData.duration % 3600) / 60)}분</Typography>
                                </Paper>
                            </Grid>

                            {/* 화물 정보 */}
                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography fontWeight="bold">화물 정보</Typography>
                                    <Typography variant="body2">화물 총 수량: 15박스</Typography>
                                    <Typography variant="body2">총 중량: 280kg</Typography>
                                    <Typography variant="body2">화물 종류: 잡화</Typography>
                                    <Typography variant="body2">
                                        특수 태그: <Typography component="span" color="primary">[신선식품]</Typography>
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* 요청 시간 */}
                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography fontWeight="bold">요청 시간</Typography>
                                    <Typography variant="body2">출발 가능 시간: 2025-07-26 오전 9:00 이후</Typography>
                                    <Typography variant="body2">도착 마감 시간: 2025-07-26 오후 6:00까지</Typography>
                                    <Typography variant="body2">요청 등록일: 2025-07-25 13:02</Typography>
                                </Paper>
                            </Grid>

                            {/* 운송 수익 정보 */}
                            <Grid item>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography fontWeight="bold">운송 수익 정보</Typography>
                                    <Typography variant="body2">기본 운임: 140,000원</Typography>
                                    <Typography variant="body2">경유지 가산금: 30,000원</Typography>
                                    <Typography variant="body2">신선화물 가산금: 20,000원</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body1" fontWeight="bold">
                                        총 수익: 190,000원 (VAT 별도)
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

        </Box>

    );
}
export default DriverIndividualScheduleComponent;