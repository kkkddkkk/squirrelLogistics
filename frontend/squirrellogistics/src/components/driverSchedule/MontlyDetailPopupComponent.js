import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, Grid,
  Paper,
  IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close"
import RouteMapComponent from "../deliveryMap/RouteMapComponent";
import { renderWarningTags } from "../deliveryRequest/deliveryFormatUtil";
import { useNavigate } from "react-router-dom";
import { fetchDeliveryReservationById } from "../../api/deliveryRequest/deliveryAssignmentAPI";
import LoadingComponent from '../../components/common/LoadingComponent';


export default function MontlyDetailPopupComponent(
  {
    open, onClose, driverId, requestId, assignedId, completed
  }) {

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const handlingTagString = renderWarningTags(data?.waypoints);

  useEffect(() => {
    if (!open || !requestId) {
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const dto = await fetchDeliveryReservationById(requestId, { signal: controller.signal });
        setData(dto);
      } catch (e) {
        setErr("상세 정보를 불러오지 못했습니다.");

        setData(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [open, requestId]);

  const goDetailPage = () => {
    // 완료건: 완료 상세(예: 운송 실적/리포트) 페이지로
    if (completed && assignedId) {
      navigate(`/driver/deliveredetail/${assignedId}`,
        { state: { ...data, isSchedule: true } });
      return;
    }
    // 미완료/예약: 요청 상세(변경/수락/취소 등) 페이지로
    navigate(`/driver/detail/${requestId}`,
        { state: { ...data, isSchedule: true } });
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontFamily: "inherit",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#2A2A2A",
            }}
          >
            운송 예약 정보
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "#888" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>

        {loading ? (
          <Box
            sx={{
              height: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingComponent open={loading} text="운송 일정 정보를 불러오는 중..." />
          </Box>
        ) : (
          data && (
            <Grid
              container
              spacing={2}
              width={"100%"}
              justifyContent={"space-between"}
              justifySelf={"center"}
              mb={3}
              mt={1}
            >
              {/* 지도 */}
              <Grid item sx={{ width: "50%" }}>
                <Paper
                  variant="outlined"
                  sx={{
                    width: "100%",
                    height: 400,
                    p: 1,
                    border: "1px solid #2a2a2a5d",
                    boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: 1.2,
                  }}
                >
                  <RouteMapComponent
                    expectedRoute={data?.expectedRoute}
                    expectedPolyline={data?.expectedPolyline}
                    waypoints={data?.waypoints}
                  />
                </Paper>
              </Grid>

              {/* 상세 텍스트 */}
              <Grid container direction={"column"} width={"40%"} justifyContent={"space-between"}>
                <Box sx={{ display: "grid", rowGap: 0.6, mt: 3 }}>
                  <Typography variant="body2">
                    <strong>운송 예약 ID:</strong> #RESV-{data?.requestId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>요청자:</strong> {data?.companyName}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>출발지:</strong> {data?.startAddress}
                  </Typography>
                  <Typography variant="body2">
                    <strong>도착지:</strong> {data?.endAddress}
                  </Typography>
                  <Typography variant="body2">
                    <strong>경유지 수:</strong> {data?.waypoints?.length ?? 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>총 이동 거리:</strong>{" "}
                    {data?.distance != null ? `약 ${(data.distance / 1000).toFixed(1)} km` : " - "}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>화물 총 수량:</strong> {data?.totalCargoCount ?? 0}박스
                  </Typography>
                  <Typography variant="body2">
                    <strong>화물 중량:</strong> {data?.totalCargoWeight ?? 0}kg
                  </Typography>
                  <Typography variant="body2">
                    <strong>특수 태그:</strong> {handlingTagString}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>총 운송 수익:</strong>{" "}
                    {data?.estimatedFee != null ? `${data.estimatedFee.toLocaleString()}원` : "-"}
                  </Typography>
                </Box>

                <DialogActions sx={{ p: 0, mt: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={goDetailPage}
                    disabled={loading || !requestId} // 로딩 중/필수키 없음 → 비활성화
                    sx={{ borderRadius: 2, width: "100%", backgroundColor: "#113F67" }}
                  >
                    예약된 운송 정보 자세히 보기
                  </Button>
                </DialogActions>
              </Grid>
            </Grid>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}