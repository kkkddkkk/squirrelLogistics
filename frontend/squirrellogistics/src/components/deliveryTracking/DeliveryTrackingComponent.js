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
  useTheme,
} from "@mui/material";
import LiveMapComponent from "../../components/deliveryMap/LiveMapComponent";
import { useStartDummyRoute } from "../../hook/DeliveryMap/useKakaoRouteMap";
import React, { useState } from "react";
import {
  formCurrnetStatusString,
  pickNextNavigation,
  pickActiveLeg,
  computeWaypointStatuses,
  STATUS_STYLES,
} from "./trackingFormatUtil";
import { ActionButtons } from "./ActionButtons";
import { useDriverStream } from "../../api/deliveryRequest/driverStreamAPI";
import { useParams } from "react-router-dom";
import { renderSingleTag } from "../deliveryRequest/deliveryFormatUtil";
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";

const DeliveryTrackingComponent = ({ data, onRefresh, onActionRun }) => {
  const thisTheme = useTheme();
  const {
    leg: activeLeg,
    index: activeIndex,
    isBeforePickup,
    isLastLeg,
    isLastDropped,
  } = pickActiveLeg(data);
  const hasNextLeg = activeLeg != null; // 다음으로 달릴 구간이 있나


  // 웹소켓으로 들어오는 실시간 경로
  const live = useDriverStream(() => localStorage.getItem('accessToken'));
  const distanceKm = live?.distance != null ? (live.distance / 1000).toFixed(1) : null;
  const durationMin = live?.duration != null ? Math.round(live.duration / 60) : null;

  const items = computeWaypointStatuses(data);
  console.log(data);
  return (
    <Box width={"100%"} sx={{ bgcolor: thisTheme.palette.background.default }}>
      {/* 페이지 최상단 제목 */}
      <Box
        sx={{ bgcolor: thisTheme.palette.background.default, py: 4, minHeight: 190 }}
      >
        <CommonTitle>현재 운송 정보</CommonTitle>

        <Grid container m={4} mb={0} justifySelf="center" width={"80%"}>
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              pt: 2,
              pb: 1,
              width: "100%",
              borderColor: thisTheme.palette.text.secondary,
            }}
          >
            <Grid
              container
              direction="column"
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              <Grid container direction="row" justifyContent="space-between">
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    color: thisTheme.palette.text.primary,
                    fontSize: "clamp(12px, 1.5vw, 18px)",
                  }}
                >
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    진행중인 운송 할당 번호:
                  </Box>{" "}
                  #DA-{data.deliveryRequestId}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    color: thisTheme.palette.text.primary,
                    fontSize: "clamp(12px, 1.5vw, 18px)",
                  }}
                >
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    현재 운송 상태:
                  </Box>{" "}
                  {formCurrnetStatusString(data)}
                </Typography>
              </Grid>

              <Divider
                sx={{ mt: 2, mb: 1, borderColor: thisTheme.palette.text.secondary }}
              />

              <Grid
                container
                spacing={2}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {isLastDropped ? (
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "clamp(10px, 1.5vw, 14px)",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <Box component="span" fontWeight="bold">
                        최종 하차지에 도착하여 경로 정보 제공을 종료합니다.
                      </Box>
                    </Typography>
                  </Grid>
                ) : isBeforePickup ? (
                  /* 2) 집하 전 */
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "clamp(10px, 1.5vw, 14px)",
                        color: thisTheme.palette.text.secondary,
                      }}
                    >
                      <Box component="span" fontWeight="bold">
                        집하지 위치:{" "}
                      </Box>{" "}
                      {Array.isArray(data?.navigate) && data.navigate.length > 0
                        ? data.navigate[0].address
                        : "-"}
                    </Typography>
                  </Grid>
                ) : (
                  /* 3) 이동/도착 중(집하 이후 ~ 최종 전) */
                  <>
                    <Grid item>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "clamp(10px, 1.5vw, 14px)",
                          color: thisTheme.palette.text.secondary,
                        }}
                      >
                        <Box component="span" fontWeight="bold">
                          다음 하차지까지 남은 거리:
                        </Box>{" "}
                        {distanceKm != null ? `${distanceKm} km` : "-"}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "clamp(10px, 1.5vw, 14px)",
                          color: thisTheme.palette.text.secondary,
                        }}
                      >
                        <Box component="span" fontWeight="bold">
                          다음 하차지까지 남은 시간:
                        </Box>{" "}
                        {durationMin != null ? `${durationMin} 분` : "-"}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "clamp(10px, 1.5vw, 14px)",
                          color: thisTheme.palette.text.secondary,
                        }}
                      >
                        <Box component="span" fontWeight="bold">
                          운송 완료까지 남은 하차지:
                        </Box>{" "}
                        {hasNextLeg
                          ? `${activeIndex}/${data.navigate.length}`
                          : "-"}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Box>

      {/* 중앙 지도 + 운송 정보 영역*/}
      <Box sx={{ px: 4, py: 3, bgcolor: thisTheme.palette.background.default }}>
        <Grid
          container
          sx={{
            width: "80%",
            justifySelf: "center",
            justifyContent: "space-between",
            mx: "auto",
          }}
        >
          {/* 좌측 지도 + 버튼 영역 */}
          <Grid item xs={12} md={6} sx={{ width: "100%" }}>
            <Grid
              container
              direction={"row"}
              justifyContent={"space-between"}
              width={"100%"}
              mb={4}
            >
              <Grid item width={"60%"}>
                {/* 상단 지도 영역 */}
                <Paper
                  variant="outlined"
                  sx={{
                    width: "100%",
                    height: 500,
                    p: 1,
                    borderColor: thisTheme.palette.text.secondary,
                    bgcolor: thisTheme.palette.background.paper,
                    boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: 1.2,
                  }}
                >
                  <LiveMapComponent route={live} onRefresh />
                </Paper>
              </Grid>

              {/* 우측 운송 정보 영역 */}
              <Grid
                container
                direction="column"
                justifyContent="space-between"
                sx={{ width: "35%" }}
              >
                <Grid item>
                  {/* 상단 화물 정보 영역 */}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {/* hasNextLeg일 때만 추가 안내 보여주기 (예시) */}
                    {isLastDropped ? (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            fontSize: "clamp(12px, 1.5vw, 16px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          전체 운송 완료
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          모든 운송이 완료되었습니다!
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          안전한 종료를 위해 반드시 하단
                          <br />
                          [전체 운송 완료] 버튼을 눌러주세요.
                        </Typography>
                      </>
                    ) : isBeforePickup ? (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            fontSize: "clamp(12px, 1.5vw, 16px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          화물 정보
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          아직 화물 집하가 완료되지 않았습니다!
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          집하지에서 화물을 픽업한 후<br />
                          [화물 집하 완료] 버튼을 눌러주세요.
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            fontSize: "clamp(12px, 1.5vw, 16px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          하차 화물 정보
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          하차지 번호:{" "}
                          <Box
                            component="span"
                            fontFamily="monospace"
                            color={thisTheme.palette.primary.main}
                          >
                            #WP-{activeLeg?.cargos?.waypointId ?? "—"}
                          </Box>
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          하차 화물 번호:{" "}
                          <Box
                            component="span"
                            fontFamily="monospace"
                            color={thisTheme.palette.primary.main}
                          >
                            #CG-{activeLeg?.cargos?.cargoId ?? "—"}
                          </Box>
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color: thisTheme.palette.text.primary,
                          }}
                        >
                          품목: {activeLeg?.cargos?.description ?? "—"}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "clamp(10px, 1.5vw, 14px)",
                            color:  thisTheme.palette.text.primary,
                          }}
                        >
                          특수 태그:{" "}
                          <Box
                            component="span"
                            fontWeight="bold"
                            color={thisTheme.palette.primary.main}
                          >
                            {renderSingleTag(
                              activeLeg?.cargos?.handlingId,
                              activeLeg?.cargos?.handlingTags
                            )}
                          </Box>
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>

                <Grid item>
                  {activeLeg == null ? (
                    <></>
                  ) : (
                    <>
                      {/* 하단 경유지 목록 영역 */}
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            fontSize: "clamp(12px, 1.5vw, 16px)",
                            color: thisTheme.palette.text.primary,
                            mb: 2,
                          }}
                        >
                          하차지 목록
                        </Typography>

                        <List disablePadding>
                          {items.map((it, idx) => {
                            const style = STATUS_STYLES[it.state];
                            const wpLabel = it.waypointId
                              ? `#WP-${String(it.waypointId)}`
                              : "#WP-?";
                            return (
                              <div key={it.waypointId ?? idx}>
                                <ListItem
                                  sx={{
                                    backgroundColor: thisTheme.palette.background.paper,
                                    borderRadius: 1,
                                    border: `solid 1px ${thisTheme.palette.text.secondary}`,
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Typography
                                        color={thisTheme.palette.text.primary}
                                        fontSize="clamp(10px, 1.5vw, 14px)"
                                      >
                                        {it.no}. {wpLabel} ({it.address})
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography
                                        color={style.color}
                                        fontSize="clamp(10px, 1.5vw, 14px)"
                                        fontWeight="bold"
                                      >
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
              onRefresh={onRefresh}
              onActionRun={onActionRun} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default DeliveryTrackingComponent;
