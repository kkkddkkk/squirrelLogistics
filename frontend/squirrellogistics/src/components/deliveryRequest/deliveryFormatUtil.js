import { Typography } from '@mui/material';

const HANDLING_TAGS = {
  1: { label: '신선 식품', color: '#31A04F' },
  2: { label: '취급 주의', color: '#d40636ff' },
  3: { label: '생물 화물', color: '#34699A' },
};

function formatAddress(address) {
  return address.length > 12 ? address.slice(0, 12) + '...' : address;
}

function formatCreatedAt(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / 60000);
  return `등록: ${diffMin}분 전`;
}

function renderWarningTags(waypoints) {
  const tagSet = new Map();

  waypoints.forEach(wp => {
    const tag = HANDLING_TAGS[wp.handling_id];
    if (tag && !tagSet.has(tag.label)) {
      tagSet.set(tag.label, tag.color);
    }
  });

  // JSX 반환
  return Array.from(tagSet).map(([label, color], idx) => (
    <Typography
      key={idx}
      component="span"
      sx={{ color, fontWeight: 'bold', fontSize: '0.8rem'}}
    >
      [{label}]
    </Typography>
  ));
}

export function formatDeliveryDTO(dto) {
  return {
    request_id: dto.request_id,
    title: `${formatAddress(dto.start_address)} → ${formatAddress(dto.end_address)}`,
    distance: `총 거리 ${dto.distance || 0}km / 경유지 ${dto.waypoints.length}곳`,
    warning: renderWarningTags(dto.waypoints), // ← 이제 JSX 배열
    profit: `수익: ${dto.estimated_fee.toLocaleString()}원`,
    registered: formatCreatedAt(dto.created_at),
  };

}