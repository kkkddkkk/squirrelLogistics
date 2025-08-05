import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import RouteMapComponent from "../../components/deliveryMap/RouteMapComponent";
import { useState } from "react";

const RequestDetailPage = () => {

    const initData = {
        startAddress: "서울특별시 강남구 테헤란로 212",
        waypoints: [
            "서울특별시 중구 세종대로 110",
            "서울특별시 용산구 이태원로 177"
        ],
        endAddress: "서울특별시 마포구 월드컵북로 396",
        distance: 0,
        duration: 0
    };


    const [deliveryData, setDeliveryData] = useState(initData);

    const handleRouteUpdate = (dist, dur) => {
        console.log(dist + " : " + dur);

        setDeliveryData(prev => ({
            ...prev,
            distance: dist,
            duration: dur
        }));
    };


    return (
        <Box width={"100%"}>
            {/* 타이틀 */}
            <Typography variant="h4" fontWeight="bold" align="center" gutterBottom pt={4}>
                운송 요청 정보
            </Typography>

            <Grid container spacing={4} sx={{ justifyContent: "space-between", p: 5 }}>
                {/* 지도 영역 */}
                <Grid item xs={12} md={5} sx={{ width: "50%" }}>
                    <Grid container spacing={2} direction="column" sx={{ width: "100%" }}>
                        <Paper variant="outlined" sx={{ width: "100%", height: 500, border: '1px solid gray' }}>
                            {/* 카카오 지도 컴포넌트 자리 */}
                            <RouteMapComponent
                                startAddress={deliveryData.startAddress}
                                waypoints={deliveryData.waypoints}
                                endAddress={deliveryData.endAddress}
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
                    <Grid container spacing={2} mt={5} justifyContent="center">
                        <Grid item>
                            <Button variant="contained" color="primary" size="large">
                                운송 수락하기
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="inherit" size="large">
                                신고하기
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* 정보 영역 */}
                <Grid item xs={12} md={5}>
                    <Grid container spacing={2} direction="column">
                        {/* 운송 정보 */}
                        <Grid item>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography fontWeight="bold">운송 정보</Typography>
                                <Typography variant="body2">요청 번호: #REQ-20250725-00123</Typography>
                                <Typography variant="body2">요청자: OO물류센터 (경기도 부천시 오정구)</Typography>
                                <Typography variant="body2">배송 유형: 일반배송 / 신선식품 포함</Typography>
                            </Paper>
                        </Grid>

                        {/* 경로 정보 */}
                        <Grid item>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography fontWeight="bold" gutterBottom>
                                    경로 정보
                                </Typography>
                                <Typography variant="body2">출발지: {deliveryData.startAddress}</Typography>
                                <Typography variant="body2">도착지: {deliveryData.endAddress}</Typography>
                                <Typography variant="body2">경유지 수: 3곳</Typography>
                                <Typography variant="body2">총 이동 거리: 약 {(deliveryData.distance / 1000).toFixed(1)}km</Typography>
                                <Typography variant="body2" gutterBottom>예상 소요 시간: {Math.floor(deliveryData.duration / 60)}분 {deliveryData.duration % 60}초</Typography>
                                <Button variant="outlined" size="small">경유지 보기</Button>
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
    );
}
export default RequestDetailPage;