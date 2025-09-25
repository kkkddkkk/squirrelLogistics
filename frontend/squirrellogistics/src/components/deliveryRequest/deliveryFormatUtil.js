import { Typography } from '@mui/material';



export function formatAddress(address, isMobile) {
  if (isMobile) {
    return address.length > 10 ? address.slice(0, 10) + '...' : address;

  } else {
    return address.length > 15 ? address.slice(0, 15) + '...' : address;
  }
}

function formatCreatedAt(createdAt, now = new Date()) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return '등록: -';

  let diffMs = now - created;
  if (diffMs < 0) diffMs = 0; // 미래값 보호

  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return '등록: 방금 전';
  }

  const MIN_PER_HOUR = 60;
  const MIN_PER_DAY = 1440;

  if (diffMin >= MIN_PER_DAY) {
    const days = Math.floor(diffMin / MIN_PER_DAY);
    return `등록: ${days}일 전`;
  }

  if (diffMin >= MIN_PER_HOUR) {
    const hours = Math.floor(diffMin / MIN_PER_HOUR);
    const mins = diffMin % MIN_PER_HOUR;
    return `등록: ${hours}시간${mins ? ` ${mins}분` : ''} 전`;
  }

  return `등록: ${diffMin}분 전`;
}

const HANDLING_COLORS = {
  1: '#ab0d08ff',  // 취급 주의
  3: '#31A04F',    // 산간 지역
  2: '#34699A',    // 취급 + 산간
  4: '#595959ff',    //없음
};

export function renderSingleTag(handlingId, handlingTags) {
  // handlingId/handlingTags가 null이면 4번(없음)으로 대체
  const effectiveId = handlingId ?? 4;
  const effectiveTags = handlingTags ?? '없음';

  const color = HANDLING_COLORS[effectiveId];

  return (
    <Typography
      component="span"
      sx={{ color, fontWeight: 'bold', fontSize: '0.8rem' }}
    >
      [{effectiveTags}]
    </Typography>
  );
}

export function renderWarningTags(waypoints) {
  if (!waypoints || waypoints.length === 0) {
    return (
      <Typography
        component="span"
        sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: "gray" }}
      >
        [없음]
      </Typography>
    )
  };
  const tagSet = new Map();

  waypoints.forEach(wp => {
    const color = HANDLING_COLORS[wp.handlingId];
    if (color && !tagSet.has(wp.handlingTags)) {
      tagSet.set(wp.handlingTags, color);
    }
  });

  return Array.from(tagSet).map(([label, color], idx) => (
    <Typography
      key={idx}
      component="span"
      sx={{ color, fontWeight: 'bold', fontSize: '0.8rem' }}
    >
      [{label}]
    </Typography>
  ));
}

export function formatDistanceKm(meters) {
  const km = (Number(meters) || 0) / 1000;
  // 소수 1자리 (원하면 2자리로 바꿔도 됨)
  return `총 거리 ${km.toLocaleString('ko-KR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}km`;
};

export function formatDeliveryDTO(dto, isMobile = false) {
  return {
    request_id: dto.requestId,
    title: `${formatAddress(dto.startAddress, isMobile)} → ${formatAddress(dto.endAddress, isMobile)}`,
    distance: `${formatDistanceKm(dto.distance)}`,

    profit: `수익: ${dto.estimatedFee.toLocaleString()}원`,
    registered: formatCreatedAt(dto.createAt),
  };

}