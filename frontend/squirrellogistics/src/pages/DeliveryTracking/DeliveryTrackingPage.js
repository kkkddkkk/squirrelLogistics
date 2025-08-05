import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useStartDummyRoute } from "../../hook/DeliveryMap/useKakaoRouteMap";
import React, { useState } from "react";


const DeliveryTrackingPage = () => {

    const startDummy = useStartDummyRoute();

    const handleStartTracking = async () => {
        try {
            await startDummy({
                driverId: "driver001",
                startLat: 37.4773,      // 광명시청
                startLng: 126.8645,
                endLat: 37.4979,        // 강남역
                endLng: 127.0276,
            });
            alert("더미 경로 시작됨");
        } catch (err) {
            alert("시작 실패");
            console.error(err);
        }
    };

    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);

    const handleRouteUpdate = (dist, dur) => {
        setDistance(dist);
        setDuration(dur);
    };

    return (
        <Box p={4}>
            {/* 페이지 최상단 제목 */}
            <Typography variant="h4" align="center" gutterBottom>
                현재 운송 정보
            </Typography>

            {/* 상단 현재 진행정보 영역 */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: "lightgray", border: '1px solid gray' }}>

                <Grid sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight="bold">운송 ID: #DREQ-20250725-00121</Typography>
                    <Typography fontWeight="bold">운송 상태: 경유지 2로 이동 중</Typography>
                </Grid>
                {/* 거리 / 도착 예정 / 남은 경유지 */}
                <Grid container spacing={2} sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                    <Grid item sx={{ p: 1, bgcolor: "white", borderRadius: '5px', border: '1px solid gray' }}>
                        <Typography variant="body2">
                            전체 남은 거리: <Box component="span" fontWeight="bold">거리: {(distance / 1000).toFixed(1)} km</Box>
                        </Typography>
                    </Grid>
                    <Grid item sx={{ p: 1, bgcolor: "white", borderRadius: '5px', border: '1px solid gray' }}>
                        <Typography variant="body2">
                            남은 시간: <Box component="span" fontWeight="bold">{Math.floor(duration / 60)}분 {duration % 60}초</Box>
                        </Typography>
                    </Grid>
                    <Grid item sx={{ p: 1, bgcolor: "white", borderRadius: '5px', border: '1px solid gray' }}>
                        <Typography variant="body2">
                            남은 경유지: <Box component="span" fontWeight="bold">2/3</Box>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>



            {/* 중앙 지도 + 운송 정보 영역*/}
            <Grid container sx={
                {
                    width: "100%",
                    justifyContent: 'space-between'
                }}>

                {/* 좌측 지도 + 버튼 영역 */}
                <Grid item xs={12} md={6} sx={{ width: "60%" }}>

                    {/* 상단 지도 영역 */}
                    <Paper sx={{ width: '97%', height: '500px', p: 1, border: '1px solid gray' }}>
                        <LiveMapComponent
                            currentPos={{ lat: 37.5665, lng: 126.9780 }}
                            destination={{ lat: 30.5702, lng: 120.9920 }}
                            onRouteUpdate={handleRouteUpdate}
                        />
                    </Paper>

                    {/* 하단 버튼 영역 */}
                    <Grid container spacing={2} mt={2}>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined" onClick={handleStartTracking}>픽업 완료</Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined">경유지 도착</Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined">하차 완료</Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button fullWidth variant="outlined">전체 운송 완료</Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* 우측 운송 정보 영역 */}
                <Grid item xs={12} md={6} sx={{ width: "35%" }}>
                    <Box display="flex" flexDirection="column" gap={2}>

                        {/* 상단 화물 정보 영역 */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                화물 정보
                            </Typography>
                            <Typography>다음 경유지: 공주시 신관동</Typography>
                            <Typography>
                                화물번호: <Box component="span" fontFamily="monospace" color="primary.main">#CARGO-01932</Box>
                            </Typography>
                            <Typography>품목: 활어 8박스</Typography>
                            <Typography>
                                특수 태그: <Box component="span" fontWeight="bold" color="primary.main">[선선식품]</Box>
                            </Typography>
                        </Paper>

                        {/* 하단 경유지 목록 영역 */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                경유지 목록
                            </Typography>
                            <List disablePadding>
                                <ListItem sx={{ backgroundColor: "grey.100", borderRadius: 1 }}>
                                    <ListItemText
                                        primary="1. #WP-117431 (천안시 동남구 청당동)"
                                        secondary={<Typography color="text.secondary" fontWeight="bold">완료</Typography>}
                                    />
                                </ListItem>
                                <Box height={8} />
                                <ListItem sx={{ backgroundColor: "blue.100", borderRadius: 1 }}>
                                    <ListItemText
                                        primary="2. #WP-117432 (공주시 신관동)"
                                        secondary={<Typography color="primary.main" fontWeight="bold">진행 중</Typography>}
                                    />
                                </ListItem>
                                <Box height={8} />
                                <ListItem sx={{ backgroundColor: "grey.100", borderRadius: 1 }}>
                                    <ListItemText
                                        primary="3. #WP-117433 (대구 서구 평리동)"
                                        secondary={<Typography color="text.secondary" fontWeight="bold">대기</Typography>}
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>



            {/* 하단 새로고침 영역 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                <Typography variant="body2" color="text.secondary">
                    위치 자동 갱신까지: 11초
                </Typography>
                <Button variant="contained" color="primary">
                    지금 바로 갱신
                </Button>
            </Box>
        </Box>
    );
};

export default DeliveryTrackingPage;