import { Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useStartDummyRoute } from "../../hook/DeliveryMap/useKakaoRouteMap";
import React, { useState } from "react";
import { formCurrnetStatusString, pickNextNavigation, pickActiveLeg, computeWaypointStatuses, STATUS_STYLES } from "./trackingFormatUtil";
import { ActionButtons } from "./ActionButtons";
import { useDriverStream } from "../../api/deliveryRequest/driverStreamAPI";
import { useParams } from "react-router-dom";
import { renderSingleTag } from "../deliveryRequest/deliveryFormatUtil";

const DeliveryTrackingComponent = ({ data, onRefresh }) => {

    const { driverId } = useParams();
    const { leg: activeLeg, index: activeIndex, isBeforePickup, isLastLeg, isLastDropped } = pickActiveLeg(data);
    const hasNextLeg = activeLeg != null;               // 다음으로 달릴 구간이 있나

    console.log("isLastLeg: " + isLastLeg + ",isBeforePickup: " + isBeforePickup + ",isLastDropped: " + isLastDropped);

    // 웹소켓으로 들어오는 실시간 경로
    const live = useDriverStream(driverId);
    // 남은 거리/시간 UI 표시용 (웹소켓 payload에 distance, duration이 오면 그대로 사용)
    const distanceKm = live?.distance != null ? (live.distance / 1000).toFixed(1) : null; // 서버 단위가 m라고 가정
    const durationMin = live?.duration != null ? Math.round(live.duration / 60) : null;    // 서버 단위가 s라고 가정

    const items = computeWaypointStatuses(data);
    console.log(activeLeg);
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
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>진행중인 운송 할당 번호:</Box> #DA-{data.deliveryRequestId}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(12px, 1.5vw, 18px)' }}
                                >
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>현재 운송 상태:</Box> {formCurrnetStatusString(data)}
                                </Typography>
                            </Grid>

                            <Divider sx={{ mt: 2, mb: 1 }} />


                            <Grid container spacing={2} sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>

                                {isLastDropped ? (
                                    <Grid item>
                                        <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                            <Box component="span" fontWeight="bold">
                                                최종 하차지에 도착하여 경로 정보 제공을 종료합니다.
                                            </Box>
                                        </Typography>
                                    </Grid>
                                ) : isBeforePickup ? (
                                    /* 2) 집하 전 */
                                    <Grid item>
                                        <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                            <Box component="span" fontWeight="bold">집하지 위치: </Box>{" "}
                                            {Array.isArray(data?.navigate) && data.navigate.length > 0 ? data.navigate[0].address : "-"}
                                        </Typography>
                                    </Grid>
                                ) : (
                                    /* 3) 이동/도착 중(집하 이후 ~ 최종 전) */
                                    <>
                                        <Grid item>
                                            <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                                <Box component="span" fontWeight="bold">다음 하차지까지 남은 거리:</Box>{" "}
                                                {distanceKm != null ? `${distanceKm} km` : "-"}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                                <Box component="span" fontWeight="bold">다음 하차지까지 남은 시간:</Box>{" "}
                                                {durationMin != null ? `${durationMin} 분` : "-"}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body2" sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#686868' }}>
                                                <Box component="span" fontWeight="bold">운송 완료까지 남은 하차지:</Box>{" "}
                                                {hasNextLeg ? `${activeIndex}/${data.navigate.length}` : "-"}
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
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
                                <LiveMapComponent route={live} onRefresh />
                            </Paper>
                        </Grid>


                        {/* 우측 운송 정보 영역 */}
                        <Grid container direction="column" justifyContent="space-between" sx={{ width: "35%" }}>
                            <Grid item>
                                {/* 상단 화물 정보 영역 */}
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    {/* hasNextLeg일 때만 추가 안내 보여주기 (예시) */}
                                    {isLastDropped ? (
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom
                                                sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A' }}>
                                                전체 운송 완료
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                모든 운송이 완료되었습니다!
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                안전한 종료를 위해 반드시 하단<br />[전체 운송 완료] 버튼을 눌러주세요.
                                            </Typography>
                                        </>
                                    ) : isBeforePickup ? (
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom
                                                sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A' }}>
                                                화물 정보
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                아직 화물 집하가 완료되지 않았습니다!
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                집하지에서 화물을 픽업한 후<br />[화물 집하 완료] 버튼을 눌러주세요.
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom
                                                sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A' }}>
                                                하차 화물 정보
                                            </Typography>

                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                하차지 번호: <Box component="span" fontFamily="monospace" color="primary.main">
                                                    #WP-{activeLeg?.cargos?.waypointId ?? '—'}
                                                </Box>
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                하차 화물 번호: <Box component="span" fontFamily="monospace" color="primary.main">
                                                    #CG-{activeLeg?.cargos?.cargoId ?? '—'}
                                                </Box>
                                            </Typography>
                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                품목: {activeLeg?.cargos?.description ?? '—'}
                                            </Typography>

                                            <Typography sx={{ fontSize: 'clamp(10px, 1.5vw, 14px)', color: '#2A2A2A' }}>
                                                특수 태그: <Box component="span" fontWeight="bold" color="primary.main">{renderSingleTag(activeLeg?.cargos?.handlingId, activeLeg?.cargos?.handlingTags)}</Box>
                                            </Typography>
                                        </>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item>
                                {activeLeg == null ?
                                    (<></>) : (
                                        <>
                                            {/* 하단 경유지 목록 영역 */}
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    sx={{ fontSize: 'clamp(12px, 1.5vw, 16px)', color: '#2A2A2A', mb: 2 }}
                                                >
                                                    하차지 목록
                                                </Typography>

                                                <List disablePadding>
                                                    {items.map((it, idx) => {
                                                        const style = STATUS_STYLES[it.state];
                                                        const wpLabel =
                                                            (it.waypointId ? `#WP-${String(it.waypointId)}` : '#WP-?');
                                                        return (
                                                            <div key={it.waypointId ?? idx}>
                                                                <ListItem sx={{ backgroundColor: "#F5F7FA", borderRadius: 1, border: "solid 1px #D1D9E6" }}>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Typography color="#2A2A2A" fontSize="clamp(10px, 1.5vw, 14px)">
                                                                                {it.no}. {wpLabel} ({it.address})
                                                                            </Typography>
                                                                        }
                                                                        secondary={
                                                                            <Typography color={style.color} fontSize="clamp(10px, 1.5vw, 14px)" fontWeight="bold">
                                                                                {style.label}
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                                {idx < items.length - 1 && <Box height={8} />}
                                                            </div>
                                                        );
                                                    })}
                                                </List>
                                            </Paper>
                                        </>
                                    )}

                            </Grid>
                        </Grid>
                    </Grid>


                    {/* 하단 버튼 영역 */}
                    <ActionButtons
                        data={data}
                        onRefresh={onRefresh} />
                </Grid>

            </Grid>
        </Box>
    );
}
export default DeliveryTrackingComponent;