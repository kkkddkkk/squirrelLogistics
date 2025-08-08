import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useStartDummyRoute } from "../../hook/DeliveryMap/useKakaoRouteMap";
import React, { useState } from "react";

const DeliveryTrackingComponent = () => {
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
        <Box width={"100%"}>
            {/* 페이지 최상단 제목 */}
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
                    }}>현재 운송 정보
                </Typography>

                <Grid container m={4} mb={0} justifySelf="center" width={"80%"}>
                    <Paper variant="outlined" sx={{ p: 6, pt: 2, pb: 1, width: "100%" }}>
                        <Grid container direction="column" justifyContent="space-between" sx={{ width: "100%" }}>


                            <Grid container direction="row" justifyContent="space-between">
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>운송 번호:</Box> #DREQ-20250725-00121
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>현재 운송 상태:</Box> 경유지 2로 이동 중
                                </Typography>
                            </Grid>

                            <Divider sx={{ mt: 2, mb: 1 }} />

                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                <Grid item>
                                    <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                        <Box component="span" fontWeight="bold">다음 경유지까지 남은 거리: </Box>  {(distance / 1000).toFixed(1)} km
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                        <Box component="span" fontWeight="bold">다음 경유지까지 남은 시간: </Box>  {Math.floor(duration / 60)}분 {duration % 60}초
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868', }}>
                                        <Box component="span" fontWeight="bold">운송 완료까지 남은 경유지:</Box> 2/3
                                    </Typography>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Paper>
                </Grid>
            </Grid>


            {/* 중앙 지도 + 운송 정보 영역*/}
            <Grid container sx={
                {
                    width: "80%",
                    justifySelf: 'center',
                    justifyContent: 'space-between',
                    mt: 3
                }}>

                {/* 좌측 지도 + 버튼 영역 */}
                <Grid item xs={12} md={6} sx={{ width: "100%" }}>

                    <Grid container direction={"row"} justifyContent={"space-between"} width={"100%"} mb={4}>
                        <Grid item width={"60%"}>
                            {/* 상단 지도 영역 */}
                            <Paper variant="outlined"
                                sx={{
                                    width: "100%",
                                    height: 500,
                                    p: 1,
                                    border: '1px solid #2a2a2a5d',
                                    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 1.2,
                                }}>
                                <LiveMapComponent
                                    currentPos={{ lat: 37.5665, lng: 126.9780 }}
                                    destination={{ lat: 30.5702, lng: 120.9920 }}
                                    onRouteUpdate={handleRouteUpdate}
                                />
                            </Paper>
                        </Grid>


                        {/* 우측 운송 정보 영역 */}
                        <Grid container direction="column" justifyContent="space-between" sx={{ width: "35%" }}>
                            <Grid item>
                                {/* 상단 화물 정보 영역 */}
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A' }}>
                                        화물 정보
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}
                                    >다음 경유지: 공주시 신관동</Typography>
                                    <Typography
                                        sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}
                                    >
                                        화물번호: <Box component="span" fontFamily="monospace" color="primary.main">#CARGO-01932</Box>
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}
                                    >품목: 활어 8박스</Typography>
                                    <Typography
                                        sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}
                                    >
                                        특수 태그: <Box component="span" fontWeight="bold" color="primary.main">[선선식품]</Box>
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item>
                                {/* 하단 경유지 목록 영역 */}
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold"
                                        sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A', mb: 2 }}
                                    >
                                        경유지 목록
                                    </Typography>
                                    <List disablePadding>
                                        <ListItem sx={{ backgroundColor: "#F5F7FA", borderRadius: 1, border: "solid 1px #D1D9E6" }}>
                                            <ListItemText
                                                primary={<Typography color='#2A2A2A' fontSize='clamp(10px, 1.5vw, 14px)'>1. #WP-117431 (천안시 동남구 청당동)</Typography>}
                                                secondary={<Typography color="#686868" fontSize='clamp(10px, 1.5vw, 14px)' fontWeight="bold" >운송 완료</Typography>}
                                            />
                                        </ListItem>
                                        <Box height={8} />
                                        <ListItem sx={{ backgroundColor: "#F5F7FA", borderRadius: 1, border: "solid 1px #D1D9E6" }}>
                                            <ListItemText
                                                primary={<Typography color='#2A2A2A' fontSize='clamp(10px, 1.5vw, 14px)'>2. #WP-117432 (공주시 신관동)</Typography>}
                                                secondary={<Typography color="#34699A" fontSize='clamp(10px, 1.5vw, 14px)' fontWeight="bold" >운송 진행 중</Typography>}
                                            />
                                        </ListItem>
                                        <Box height={8} />
                                        <ListItem sx={{ backgroundColor: "#F5F7FA", borderRadius: 1, border: "solid 1px #D1D9E6" }}>
                                            <ListItemText
                                                primary={<Typography color='#2A2A2A' fontSize='clamp(10px, 1.5vw, 14px)'>3. #WP-117433 (대구 서구 평리동)</Typography>}
                                                secondary={<Typography color="#31A04F" fontSize='clamp(10px, 1.5vw, 14px)' fontWeight="bold" >운송 대기</Typography>}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>


                    {/* 하단 버튼 영역 */}
                    <Grid container width={"100%"} direction={"column"}>

                        {/* 1줄: 집하처 이동 시작, 집하 완료, 경유지 도착 */}
                        <Grid container width={"100%"} direction={"row"} justifyContent={"space-between"} mb={2}>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined">집하처 이동 시작</Button>
                            </Grid>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined" onClick={handleStartTracking}>화물 집하 완료</Button>
                            </Grid>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined">2번 경유지 도착</Button>
                            </Grid>
                        </Grid>
                        {/* 2줄: 경유지 하차 완료, 전체 완료, 사고 발생 */}

                        <Grid container width={"100%"} direction={"row"} justifyContent={"space-between"} mb={4}>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined">2번 경유지 하차 완료</Button>
                            </Grid>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined">전체 운송 완료</Button>
                            </Grid>
                            <Grid item width={"30%"}>
                                <Button fullWidth variant="outlined" color="error">정지/ 사고 발생</Button>
                            </Grid>
                        </Grid>



                    </Grid>
                </Grid>

                {/* 하단 새로고침 영역 */}
                <Grid container direction={"row"} justifyContent="space-between" alignItems={"center"} width={"100%"} mb={4}>

                    <Grid item>
                        <Typography variant="body2" color='#2A2A2A'>
                            위치 자동 갱신까지: 11초
                        </Typography>
                    </Grid>

                    <Grid item>
                        <Button variant="contained" color="primary"
                            sx={{ bgcolor: '#113F67' }}>
                            위치 새로고침
                        </Button>
                    </Grid>


                </Grid>

            </Grid>
        </Box>
    );
}
export default DeliveryTrackingComponent;