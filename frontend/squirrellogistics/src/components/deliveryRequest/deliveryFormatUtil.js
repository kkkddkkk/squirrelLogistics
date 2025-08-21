import { Typography } from '@mui/material';



export function formatAddress(address) {
  return address.length > 15 ? address.slice(0, 15) + '...' : address;
}

function formatCreatedAt(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 60000);
  return `등록: ${diffMin}분 전`;
}

const HANDLING_COLORS = {
  1: '#31A04F',    // 신선 식품
  2: '#ab0d08ff',  // 취급 주의
  3: '#34699A',    // 생물 화물
  4: '#8d0505ff',    // 위험물
  5: '#a36700ff',    // 고가품
  6: '#595959ff',    // 대형 화물
  7: '#179174ff',    // 온도 민감
  8: '#0053a1ff',    // 액체 화물
  9: '#075800ff',    // 장거리 운송

};

export function renderSingleTag(handlingId,handlingTags) {
  const tagSet = new Map();
  const color = HANDLING_COLORS[handlingId];
  if (color && !tagSet.has(handlingId)) {
    tagSet.set(handlingId, color);
  }

  return (
    <Typography
      component="span"
      sx={{ color, fontWeight: 'bold', fontSize: '0.8rem' }}
    >
      [{handlingTags}]
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

export function formatDeliveryDTO(dto) {
  return {
    request_id: dto.requestId,
    title: `${formatAddress(dto.startAddress)} → ${formatAddress(dto.endAddress)}`,
    distance: `${formatDistanceKm(dto.distance)}`,

    warning: renderWarningTags(dto.waypoints), // ← 이제 JSX 배열
    profit: `수익: ${dto.estimatedFee.toLocaleString()}원`,
    registered: formatCreatedAt(dto.createAt),
  };

}