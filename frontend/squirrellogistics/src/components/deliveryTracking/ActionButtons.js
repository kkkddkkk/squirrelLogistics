import { Button, Grid, Stack, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { postDriverAction } from '../../api/deliveryRequest/deliveryAssignmentAPI';
import TwoButtonPopupComponent from '../deliveryRequest/TwoButtonPopupComponent'; // 경로는 프로젝트 구조에 맞춰 조정

// props: data(=trackData), onRefresh(), onActionRun(fn) // onActionRun은 페이지 로딩 오버레이 래퍼
export function ActionButtons({ data, onRefresh, onActionRun }) {
  const last = data?.lastStatusLog || null;
  const status = last?.status || null;

  const legs = Array.isArray(data?.navigate) ? data.navigate : [];
  const finalNodeIndex = legs.length; // START=0 ... DEST=finalNodeIndex
  const lastVisited = Number.isInteger(last?.lastVisitedWaypoint) ? last.lastVisitedWaypoint : null;
  const signature = `${last?.status || 'NONE'}|${Number.isInteger(last?.lastVisitedWaypoint) ? last.lastVisitedWaypoint : -1}`;

  // 전이 잠금 상태
  const [transitLock, setTransitLock] = useState(false);
  const [nextConfirm, setNextConfirm] = useState(null);
  const prevSignatureRef = useRef(signature);
  const atFinalNode = lastVisited === finalNodeIndex;

  // ---- 연타 방지 상태 ----
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- 확인 팝업 상태 ----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmContent, setConfirmContent] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmMode, setConfirmMode] = useState('confirm');
  const lastActionRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const MIN_INTERVAL_MS = 800;

  const thisTheme = useTheme();

  useEffect(() => {
    if (prevSignatureRef.current !== signature) {
      prevSignatureRef.current = signature;
      setTransitLock(false); // ← 새 상태 반영됨, 잠금 해제
    }
  }, [signature]);

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
      (lastVisited <= finalNodeIndex),
    complete: status === 'DROPPED_AT_WAYPOINT' && atFinalNode,
    skip: status === 'MOVING_TO_WAYPOINT' && (lastVisited ?? 0) + 1 < legs.length,
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
    rules.arrived && arriveTargetIndex != null ? `${labelForNode(arriveTargetIndex)} 도착` : '하차지 도착';
  const dropLabel =
    rules.dropped && dropTargetIndex != null ? `${labelForNode(dropTargetIndex)} 하차 완료` : '하차 완료';

  const assignedId = data?.assignedId;

  // ---- 공통 실행기 ----
  const doAction = async (action, detour = false) => {
    // 연타 방지 + 동일 액션 최소 간격
    if (!assignedId || isSubmitting) return;
    const now = Date.now();
    if (now - lastSentAtRef.current < MIN_INTERVAL_MS && lastActionRef.current === action) return;

    setIsSubmitting(true);
    setTransitLock(true);
    lastActionRef.current = action;
    lastSentAtRef.current = now;

    try {
      if (onActionRun) {
        // 페이지 로딩 포함 래퍼 사용 (postDriverAction + refetch를 안에서 수행)
        await onActionRun(async () => {
          await postDriverAction(assignedId, action, { detour });
        });
      } else {
        // 폴백: 여기서 직접 호출 후 onRefresh
        await postDriverAction(assignedId, action, { detour });
        await onRefresh?.();
      }
    } catch (err) {
      console.error('postDriverAction failed:', err?.response?.status, err?.response?.data || err?.message);
      setTransitLock(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  const openNextConfirmIfAny = () => {
    if (!nextConfirm) return false;
    setConfirmTitle(nextConfirm.title || '확인');
    setConfirmContent(nextConfirm.content || '이 작업을 진행할까요?');
    setConfirmMode(nextConfirm.mode || 'confirm');
    setConfirmOpen(true);
    setNextConfirm(null);
    return true;
  };

  // ---- 확인 팝업 트리거 ----
  const showConfirm = (action, { title, content, mode = 'confirm', next = null }) => {
    setPendingAction(action);
    setConfirmTitle(title || '확인');
    setConfirmContent(content || '이 작업을 진행할까요?');
    setConfirmMode(mode);
    setNextConfirm(next);
    setConfirmOpen(true);
  };

  const handleConfirmLeft = async () => {
    const action = pendingAction;
    setConfirmOpen(false);
    if (!action) return;

    if (confirmMode === 'routeChoice') {
      // 정상 경로 선택
      await doAction(action, false);
    } // confirm 모드의 좌(취소)는 아무것도 안 함
  };

  const handleConfirmRight = async () => {
    const action = pendingAction;
    setConfirmOpen(false);
    if (!action) return;

    if (confirmMode === 'routeChoice') {
      // 이탈 경로 선택
      await doAction(action, true);
    } else {
      const moved = openNextConfirmIfAny(); // step2로 전환
      if (!moved) {
        await doAction(action);
      }
    }
  };

  const buildNextRouteChoice = () => ({
    mode: 'routeChoice',
    title: '경로 선택 (개발자 모드)',
    content: <>다음 경로 이동을 시작합니다. 유형을 선택해주세요.</>,
  });

  const disabledAll = isSubmitting || confirmOpen || transitLock;

  // ---- JSX ----
  return (
    <Grid container width="100%" direction="column">
      {/* 1줄 */}
      <Grid container direction="row" justifyContent="space-between" mb={2}>
        <Grid item width="30%">
          <Button
            fullWidth
            variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
            disabled={disabledAll || !rules.startToPickup}
            onClick={() => doAction('START_TO_PICKUP')}
          >
            집하지 이동 시작
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
            disabled={disabledAll || !rules.pickupCompleted}
            // onClick={() => doAction('PICKUP_COMPLETED')}
            onClick={() =>
              showConfirm('PICKUP_COMPLETED', {
                mode: 'confirm',
                title: '집하 완료',
                content: <>화물 집하 완료 처리하시겠습니까?</>,
                next: legs.length > 1 ? buildNextRouteChoice() : null,
              })
            }
          >
            화물 집하 완료
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
            disabled={disabledAll || !rules.arrived}
            onClick={() =>
              showConfirm('ARRIVED_AT_WAYPOINT', {
                title: '도착 처리',
                content: <>{arriveLabel} 처리하시겠습니까?</>,
              })
            }
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
            variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
            disabled={disabledAll || !rules.dropped}
            onClick={() =>
              showConfirm('DROPPED_AT_WAYPOINT', {
                mode: 'confirm',
                title: '하차 완료',
                content: <>{dropLabel} 처리하시겠습니까?</>,
                next: !atFinalNode ? buildNextRouteChoice() : null,
              })
            }
          >
            {dropLabel}
          </Button>
        </Grid>
        <Grid item width="30%">
          <Button
            fullWidth
            variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
            disabled={disabledAll || !rules.complete}
            onClick={() =>
              showConfirm('COMPLETE', {
                title: '전체 운송 완료',
                content: (
                  <>
                    전체 운송을 완료 처리합니다.
                    <br />
                    완료 처리 후에는 되돌릴 수 없습니다. 진행하시겠습니까?
                  </>
                ),
              })
            }
          >
            전체 운송 완료
          </Button>
        </Grid>
        <Grid item width="30%">
          <Stack direction="row" spacing={1}>
            <Button
              variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
              color="error"
              sx={{ flex: 1 }}
              disabled={disabledAll || !rules.skip}
              onClick={() =>
                showConfirm('SKIPPED_WAYPOINT', {
                  title: '하차지 건너뛰기',
                  content: (
                    <>
                      다음 하차지를 건너뜁니다.
                      <br />
                      해당 조치는 회사에서도 모니터링되며
                      <br />
                      정산에 반영될 수 있습니다. 진행하시겠습니까?
                    </>
                  ), next: buildNextRouteChoice() ,
                })
              }
            >
              하차지 건너뛰기
            </Button>
            <Button
              variant={thisTheme.palette.mode==="light"?"outlined":"contained"}
              color="error"
              sx={{ flex: 1 }}
              disabled={disabledAll}
              onClick={() =>
                showConfirm('PAUSE', {
                  title: '정지/사고 발생',
                  content: (
                    <>
                      운송을 일시 정지 처리합니다.
                      <br />
                      해당 조치는 의뢰자에게도 모니터링되며
                      <br />
                      정산에 반영될 수 있습니다. 진행하시겠습니까?
                    </>
                  ),
                })
              }
            >
              정지/사고 발생
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* 확인 팝업 */}
      {confirmOpen && (
        <TwoButtonPopupComponent
          open={confirmOpen}
          leftTxt={confirmMode === 'routeChoice' ? '정상경로' : '취소'}
          rightTxt={confirmMode === 'routeChoice' ? '이탈경로' : '확인'}
          onLeftClick={handleConfirmLeft}
          onRightClick={handleConfirmRight}
          title={confirmTitle}
          content={confirmContent}
        />
      )}
    </Grid>
  );
}
