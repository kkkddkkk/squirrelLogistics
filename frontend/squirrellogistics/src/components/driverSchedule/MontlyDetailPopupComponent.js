import React, { useMemo, useState } from "react";
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


export default function MontlyDetailPopupComponent({ driverId, open, onClose, event }) {

  const [eventData, setEventData] = useState(event);
  const waypoints = useMemo(() => eventData?.waypoints || [], [event]);
  const navigate = useNavigate();

  const handlingTagString = renderWarningTags(eventData?.waypoints);

  const handleRouteUpdate = (dist, dur) => {

    setEventData(prev => ({
      ...prev,
      distance: dist,
      duration: dur
    }));
  };

  const onGoDetail = () => {
    navigate(`/driver/${driverId}/schedule/${event.schedule_id}`, { state: { event } });
  }


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle >
        <Box display="flex" alignItems="center">
          {/* 가운데 제목 */}
          <Typography
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              fontFamily: 'inherit',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2A2A2A',
            }}
          >
            운송 예약 정보
          </Typography>

          {/* 우측 닫기 버튼 */}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#888',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent >
        <Grid container
          spacing={2}
          width={"100%"}
          justifyContent={"space-between"}
          justifySelf={"center"}
          mb={3}
          mt={1}
        >
          {/* 지도 */}

          <Grid item sx={{ width: "50%" }}>
            <Paper variant="outlined"
              sx={{
                width: "100%",
                height: 400,
                p: 1,
                border: '1px solid #2a2a2a5d',
                boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: 1.2,
              }}>
              {/* 카카오 지도 컴포넌트 자리 */}

              <RouteMapComponent
                startAddress={eventData?.start_address}
                waypoints={eventData?.waypoints}
                endAddress={eventData?.end_address}
                onRouteUpdate={handleRouteUpdate}
              />
            </Paper>
          </Grid>

          {/* 상세 텍스트 */}
          <Grid container direction={"column"} width={"40%"} justifyContent={"space-between"}>
            <Box sx={{ display: "grid", rowGap: .3, mt: 3 }}>
              <Typography variant="body2"><strong>운송 예약 ID:</strong> #RESV-{eventData?.schedule_id}</Typography>
              <Typography variant="body2"><strong>요청자:</strong> {eventData?.company_name}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2"><strong>출발지:</strong> {eventData?.start_address}</Typography>
              <Typography variant="body2"><strong>도착지:</strong> {eventData?.end_address}</Typography>
              <Typography variant="body2"><strong>경유지 수:</strong> {waypoints.length}</Typography>
              <Typography variant="body2"><strong>총 이동 거리:</strong> 약 {eventData?.distance ? (eventData?.distance / 1000).toFixed(1) : " - "}km</Typography>
              <Typography variant="body2"><strong>예상 소요 시간:</strong> 약 {eventData?.distance ? Math.floor(eventData?.duration / 3600) : " - "}시간 {eventData?.distance ? Math.floor((eventData?.duration % 3600) / 60) : " - "}분</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2"><strong>화물 총 수량:</strong> {eventData?.total_cargo_count ?? "0"}박스</Typography>
              <Typography variant="body2"><strong>화물 중량:</strong> {eventData?.total_cargo_weight ?? "0"}kg</Typography>
              <Typography variant="body2"><strong>특수 태그:</strong> {handlingTagString}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2"><strong>총 운송 수익:</strong> {eventData?.estimated_fee.toLocaleString()}원</Typography>
            </Box>

            <DialogActions sx={{ p: 0, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => onGoDetail ? onGoDetail(event) : onClose()}
                sx={{
                  borderRadius: 2,
                  width: '100%',
                  backgroundColor: "#113F67"
                }} // ← 너비 지정
              >
                예약된 운송 정보 자세히 보기
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </DialogContent>


    </Dialog>
  );
}