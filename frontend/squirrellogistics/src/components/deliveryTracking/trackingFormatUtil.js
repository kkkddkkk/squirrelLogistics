export function formCurrnetStatusString(data) {

    if (data === null || data.lastStatusLog === null) {
        return "집하지 출발 대기 중";
    }

    const status = data.lastStatusLog.status;
    const this_idx = data.lastStatusLog.lastVisitedWaypoint;

    if (status === "MOVING_TO_PICKUP") {
        return "집하지 이동 중";
    }
    else if (status === "MOVING_TO_WAYPOINT") {
        return `${this_idx + 1}번 하차지로 이동 중`;
    } else if (status === "ARRIVED_AT_WAYPOINT") {
        return `${this_idx}번 하차지 하차 작업 중`;
    } else if (status === "DROPPED_AT_WAYPOINT") {
        return `${this_idx + 1}번 하차지 하차 작업 완료`;
    } else if (status === "COMPLETED") {
        return "전체 운송 완료";
    } else {
        return `ERROR UNDEFINED: ${status}`;
    }
}

export const STATUS_STYLES = {
    DONE: { label: '운송 완료', color: '#686868' },
    ACTIVE: { label: '운송 진행 중', color: '#34699A' },
    PENDING: { label: '운송 대기', color: '#31A04F' }
};

export function computeWaypointStatuses(trackData) {
    const legs = trackData?.navigate ?? [];
    const last = trackData?.lastStatusLog ?? null;
    const status = last?.status ?? 'READY';
    const lv = Number.isInteger(last?.lastVisitedWaypoint) ? last.lastVisitedWaypoint : null;

    const n = legs.length;
    if (n === 0) return [];

    // 경유지 번호 j는 1..n, leg 인덱스는 j-1
    const items = Array.from({ length: n }, (_, j0) => {
        const leg = legs[j0];
        return {
            no: j0 + 1,
            waypointId: leg?.waypointId ?? null,
            address: leg?.address ?? '',
            state: 'PENDING',
        };
    });

    // 완료/취소: 전부 완료 처리(정책에 맞게 조정 가능)
    if (status === 'COMPLETED' || status === 'CANCELLED') {
        return items.map(it => ({ ...it, state: 'DONE' }));
    }

    // ✅ 집하 전 단계: 전부 대기
    if (status === 'READY' || status === 'MOVING_TO_PICKUP') {
        return items; // 모두 PENDING
    }

    // ✅ 집하 완료 직후: 1번 경유지만 진행 중
    if (status === 'PICKUP_COMPLETED') {
        items[0].state = 'ACTIVE';
        for (let k = 1; k < n; k++) items[k].state = 'PENDING';
        return items;
    }

    // 이 아래는 lastVisited가 의미 있음 (START=0, 경유지1=1, ...)
    const lastVisited = (lv == null ? -1 : lv);

    switch (status) {
        case 'MOVING_TO_WAYPOINT': {
            // 진행 중 = lastVisited+1
            const activeJ = lastVisited + 1;
            for (let j = 1; j <= n; j++) {
                if (j <= lastVisited) items[j - 1].state = 'DONE';
                else if (j === activeJ) items[j - 1].state = 'ACTIVE';
                else items[j - 1].state = 'PENDING';
            }
            break;
        }
        case 'ARRIVED_AT_WAYPOINT':
        case 'ON_HOLD': {
            // 정차 중 = lastVisited
            for (let j = 1; j <= n; j++) {
                if (j < lastVisited) items[j - 1].state = 'DONE';
                else if (j === lastVisited) items[j - 1].state = 'ACTIVE';
                else items[j - 1].state = 'PENDING';
            }
            break;
        }
        case 'DROPPED_AT_WAYPOINT': {
            // lastVisited까지 완료, 다음이 있으면 next 진행 중
            const nextJ = lastVisited + 1;
            for (let j = 1; j <= n; j++) {
                if (j <= lastVisited) items[j - 1].state = 'DONE';
                else if (j === nextJ) items[j - 1].state = 'ACTIVE';
                else items[j - 1].state = 'PENDING';
            }
            break;
        }
        default: {
            // 방어: lastVisited까지 완료, 그 다음 진행
            const activeJ = Math.min(lastVisited + 1, n);
            for (let j = 1; j <= n; j++) {
                if (j <= lastVisited) items[j - 1].state = 'DONE';
                else if (j === activeJ) items[j - 1].state = 'ACTIVE';
                else items[j - 1].state = 'PENDING';
            }
        }
    }

    return items;
}


export function pickActiveLeg(trackData) {
  const legs = trackData?.navigate ?? [];
  const last = trackData?.lastStatusLog ?? null;
  if (!Array.isArray(legs) || legs.length === 0) {
    return { leg: null, index: -1, isBeforePickup: true, isLastLeg: false, isLastDropped: false };
  }

  const status = last?.status ?? 'READY';
  const lastVisited = Number.isInteger(last?.lastVisitedWaypoint) ? last.lastVisitedWaypoint : null;

  // 운송 종료
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    return { leg: null, index: -1, isBeforePickup: false, isLastLeg: false, isLastDropped: false };
  }

  // 집하 전
  if (status === 'READY' || status === 'MOVING_TO_PICKUP') {
    return { leg: null, index: -1, isBeforePickup: true, isLastLeg: false, isLastDropped: false };
  }

  // 집하 완료 직후부터 첫 leg 활성
  if (status === 'PICKUP_COMPLETED') {
    const idx = 0;
    return {
      leg: legs[idx] ?? null,
      index: legs[idx] ? idx : -1,
      isBeforePickup: false,
      isLastLeg: legs.length === 1,
      isLastDropped: false
    };
  }

  // 이후 로직
  let idx;
  switch (status) {
    case 'MOVING_TO_WAYPOINT':
      idx = Math.max(0, lastVisited ?? 0);
      break;
    case 'ARRIVED_AT_WAYPOINT':
    case 'DROPPED_AT_WAYPOINT':
    case 'ON_HOLD':
      idx = (lastVisited == null) ? -1 : lastVisited - 1;
      break;
    default:
      idx = lastVisited ?? 0;
  }

  if (idx < 0 || idx >= legs.length) {
    return { leg: null, index: -1, isBeforePickup: false, isLastLeg: false, isLastDropped: false };
  }

  const isLastLeg = idx === legs.length - 1;
  const isLastDropped = isLastLeg && status === 'DROPPED_AT_WAYPOINT';

  return {
    leg: legs[idx],
    index: idx,
    isBeforePickup: false,
    isLastLeg,
    isLastDropped
  };
}
