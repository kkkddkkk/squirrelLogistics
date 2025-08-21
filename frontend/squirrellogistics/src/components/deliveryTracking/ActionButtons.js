import { Button, Grid, Stack } from '@mui/material';
import { useRef, useState } from 'react';
import { postDriverAction } from '../../api/deliveryRequest/deliveryAssignmentAPI';

// props: data(=trackData), onRefresh()
export function ActionButtons({ data, onRefresh }) {
  const last = data?.lastStatusLog || null;
  const status = last?.status || null;

  const legs = Array.isArray(data?.navigate) ? data.navigate : [];
  const finalNodeIndex = legs.length; // START=0 ... DEST=finalNodeIndex
  const lastVisited = Number.isInteger(last?.lastVisitedWaypoint)
    ? last.lastVisitedWaypoint
    : null;

  const atFinalNode = lastVisited === finalNodeIndex;
  const destHasCargo =
    legs.length > 0 && Array.isArray(legs[legs.length - 1]?.cargos) && legs[legs.length - 1].cargos.length > 0;

  // ---- 연타 방지 상태 ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastActionRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const MIN_INTERVAL_MS = 800;

  // ---- 버튼 활성 규칙 ----
  const rules = {
    startToPickup: last == null,
    pickupCompleted: status === 'MOVING_TO_PICKUP',
    arrived:
      status === 'MOVING_TO_WAYPOINT' &&
      (lastVisited != null ? lastVisited + 1 <= finalNodeIndex : true),
    dropped:
      status === 'ARRIVED_AT_WAYPOINT' &&
      lastVisited != null &&
      lastVisited >= 1 &&
      (lastVisited < finalNodeIndex || (lastVisited === finalNodeIndex)),
    complete:
      (status === 'DROPPED_AT_WAYPOINT') &&
      atFinalNode,
    skip:
      status === 'MOVING_TO_WAYPOINT' &&
      (lastVisited ?? 0) + 1 < legs.length,
  };

  // ---- 라벨 유틸 ----
  const labelForNode = (idx) => {
    if (idx === 0) return '상차지';
    if (idx === finalNodeIndex) return '최종 하차지';
    return `${idx}번 하차지`;
  };

  const arriveTargetIndex =
    status === 'MOVING_TO_WAYPOINT' ? Math.min((lastVisited ?? -1) + 1, finalNodeIndex) : null;

  const dropTargetIndex = status === 'ARRIVED_AT_WAYPOINT' ? lastVisited : null;

  const arriveLabel =
    rules.arrived && arriveTargetIndex != null
      ? `${labelForNode(arriveTargetIndex)} 도착`
      : '하차지 도착';

  const dropLabel =
    rules.dropped && dropTargetIndex != null
      ? `${labelForNode(dropTargetIndex)} 하차 완료`
      : '하차 완료';

  const assignedId = data?.assignedId;

  // ---- 공통 클릭 핸들러 ----
  const click = async (action) => {
    if (!assignedId || isSubmitting) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < MIN_INTERVAL_MS && lastActionRef.current === action) {
      return;
    }

    setIsSubmitting(true);
    lastActionRef.current = action;
    lastSentAtRef.current = now;

    try {
      await postDriverAction(assignedId, action);
      onRefresh();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '요청 처리 중 오류가 발생했습니다.';
      alert(`처리 실패: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const askAndClick = (action, message) => {
    const ok = window.confirm(
      `${message}\n\n해당 조치는 회사에서도 모니터링되며 추후 정산에 반영될 수 있습니다. 진행할까요?`
    );
    if (ok) click(action);
  };

  const disabledAll = isSubmitting;

  // ---- JSX ----
  return (
    <Grid container width="100%" direction="column">
      {/* 1줄 */}
      <Grid container direction="row" justifyContent="space-between" mb={2}>
        <Grid item width="30%">
          <Button
            fullWidth
            variant="outlined"
            disabled={disabledAll || !rules.startToPickup}
            onClick={() => click('START_TO_PICKUP')}
          >
            집하지 이동 시작
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant="outlined"
            disabled={disabledAll || !rules.pickupCompleted}
            onClick={() => click('PICKUP_COMPLETED')}
          >
            화물 집하 완료
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant="outlined"
            disabled={disabledAll || !rules.arrived}
            onClick={() => click('ARRIVED_AT_WAYPOINT')}
          >
            {arriveLabel}
          </Button>
        </Grid>
      </Grid>

      {/* 2줄 */}
      <Grid container direction="row" justifyContent="space-between" mb={4}>
        <Grid item width="30%">
          <Button
            fullWidth
            variant="outlined"
            disabled={disabledAll || !rules.dropped}
            onClick={() => click('DROPPED_AT_WAYPOINT')}
          >
            {dropLabel}
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant="outlined"
            disabled={disabledAll || !rules.complete}
            onClick={() => click('COMPLETE')}
          >
            전체 운송 완료
          </Button>
        </Grid>
        <Grid item width="30%">
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              sx={{ flex: 1 }}
              disabled={disabledAll || !rules.skip}
              onClick={() => askAndClick('SKIPPED_WAYPOINT', '다음 하차지 건너뛰기')}
            >
              다음 하차지 건너뛰기
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ flex: 1 }}
              disabled={disabledAll}
              onClick={() => askAndClick('PAUSE', '정지/사고 발생 처리')}
            >
              정지/사고 발생
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
