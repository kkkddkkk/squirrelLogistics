// src/components/illustrations/LogiIllustrations.jsx
import * as React from "react";
import { useTheme } from "@mui/material/styles";

/**
 * 공통 컨테이너: 그림자/라운드/여백 통일
 */
function Frame({ children }) {
    return (
        <svg
            viewBox="0 0 800 520"
            width="100%"
            style={{
                display: "block",
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(16,24,40,.08)",
                background: "#fff",
            }}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* 안전 여백 */}
            <rect x="0" y="0" width="800" height="520" fill="#fff" rx="16" />
            {children}
        </svg>
    );
}

/** 1) 즉시 견적: 카드 + 요금 배지 + 미니 폼 */
export function QuoteIllustration() {
    const theme = useTheme();
    const P = theme.palette.primary.main;
    const G = "#EEF2F6";
    const T = "#344054";

    return (
        <Frame>
            {/* 대시보드 패널 */}
            <rect x="44" y="44" width="712" height="280" rx="14" fill={G} />
            <rect x="64" y="74" width="300" height="24" rx="6" fill="#fff" />
            <rect x="64" y="112" width="380" height="18" rx="5" fill="#fff" opacity="0.8" />
            <rect x="64" y="140" width="420" height="18" rx="5" fill="#fff" opacity="0.8" />
            <rect x="64" y="168" width="360" height="18" rx="5" fill="#fff" opacity="0.8" />
            {/* 요금 배지 */}
            <g transform="translate(520, 80)">
                <rect width="180" height="80" rx="12" fill="#fff" />
                <text x="16" y="34" fontFamily="Inter, system-ui" fontSize="14" fill={T}>예상 운임</text>
                <text x="16" y="62" fontFamily="Inter, system-ui" fontWeight="700" fontSize="24" fill={P}>
                    ₩ 128,500
                </text>
            </g>
            {/* 하단 폼 */}
            <g transform="translate(44, 354)">
                <rect width="712" height="122" rx="14" fill={G} />
                <rect x="20" y="24" width="170" height="26" rx="6" fill="#fff" />
                <rect x="200" y="24" width="170" height="26" rx="6" fill="#fff" />
                <rect x="380" y="24" width="170" height="26" rx="6" fill="#fff" />
                <rect x="560" y="20" width="132" height="36" rx="8" fill={P} />
                <text x="588" y="43" fontFamily="Inter, system-ui" fontSize="12" fill="#fff">즉시 견적</text>
                {/* 가늘한 안내 텍스트 */}
                <rect x="20" y="68" width="300" height="10" rx="5" fill="#fff" opacity=".9" />
                <rect x="20" y="86" width="220" height="10" rx="5" fill="#fff" opacity=".9" />
            </g>
        </Frame>
    );
}

/** 2) 스마트 배차: 지도 + 경로 + 기사 카드 */
export function DispatchIllustration() {
    const theme = useTheme();
    const P = theme.palette.primary.main;
    const G = "#E8F1FF";
    const T = "#0F172A";

    return (
        <Frame>
            {/* 지도 영역 */}
            <rect x="24" y="24" width="520" height="472" rx="14" fill={G} />
            {/* 경로(베지에 커브) */}
            <path
                d="M70 420 C 200 120, 360 160, 520 220"
                stroke={P}
                strokeWidth="6"
                fill="none"
            />
            {/* 출/도착 마커 */}
            <circle cx="70" cy="420" r="10" fill="#fff" stroke={P} strokeWidth="6" />
            <circle cx="520" cy="220" r="10" fill="#fff" stroke={P} strokeWidth="6" />
            {/* ETA 태그 */}
            <rect x="440" y="240" rx="8" width="92" height="30" fill="#fff" stroke={P} />
            <text x="452" y="260" fontFamily="Inter, system-ui" fontSize="12" fill={P}>ETA 14:32</text>

            {/* 오른쪽 기사 카드 */}
            <g transform="translate(562, 48)">
                <rect width="214" height="120" rx="14" fill="#fff" />
                <text x="16" y="32" fontFamily="Inter, system-ui" fontWeight="700" fontSize="16" fill={T}>
                    스마트 배차
                </text>
                <text x="16" y="58" fontFamily="Inter, system-ui" fontSize="12" fill="#475569">
                    Driver: Kim / 1톤 냉동
                </text>
                <rect x="16" y="76" width="90" height="24" rx="8" fill={P} />
                <text x="30" y="92" fontFamily="Inter, system-ui" fontSize="12" fill="#fff">
                    배차 완료
                </text>
            </g>

            {/* 두 번째 작은 카드 */}
            <g transform="translate(562, 188)">
                <rect width="214" height="120" rx="14" fill="#fff" />
                <text x="16" y="40" fontFamily="Inter, system-ui" fontSize="12" fill="#475569">
                    지연 알림 · 도착지 변경 자동 반영
                </text>
                <rect x="16" y="66" width="182" height="8" rx="4" fill={P} opacity=".2" />
                <rect x="16" y="82" width="146" height="8" rx="4" fill={P} opacity=".1" />
            </g>
        </Frame>
    );
}

/** 3) 정산 자동화: 그래프 + 리포트 카드 */
export function BillingIllustration() {
    const theme = useTheme();
    const P = theme.palette.primary.main;
    const S = theme.palette.success.main;
    const T = "#111827";
    const G = "#F1F5F9";

    return (
        <Frame>
            {/* 그래프 패널 */}
            <rect x="40" y="44" width="480" height="380" rx="14" fill={G} />
            {/* 가상 라인 그래프 */}
            <polyline
                points="60,380 120,320 180,360 240,260 300,300 360,220 420,240 500,180"
                fill="none"
                stroke={P}
                strokeWidth="4"
            />
            {/* 바 차트 */}
            <g transform="translate(60, 400)" fill={S}>
                <rect x="0" y="-20" width="18" height="20" rx="4" />
                <rect x="28" y="-36" width="18" height="36" rx="4" />
                <rect x="56" y="-28" width="18" height="28" rx="4" />
                <rect x="84" y="-46" width="18" height="46" rx="4" />
            </g>

            {/* 오른쪽 리포트 카드 */}
            <g transform="translate(548, 60)">
                <rect width="212" height="148" rx="14" fill="#fff" />
                <text x="16" y="34" fontFamily="Inter, system-ui" fontWeight="700" fontSize="16" fill={T}>
                    정산 리포트
                </text>
                <text x="16" y="60" fontFamily="Inter, system-ui" fontSize="12" fill="#475569">
                    월 비용: ₩ 48,120,000
                </text>
                <rect x="16" y="76" width="180" height="8" rx="4" fill={P} opacity=".2" />
                <rect x="16" y="92" width="140" height="8" rx="4" fill={P} opacity=".1" />
                <rect x="16" y="116" width="80" height="24" rx="8" fill={P} />
                <text x="34" y="133" fontFamily="Inter, system-ui" fontSize="12" fill="#fff">
                    PDF 다운
                </text>
            </g>
        </Frame>
    );
}
