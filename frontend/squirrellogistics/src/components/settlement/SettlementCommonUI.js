import { Box, Chip, Paper, Stack, Typography, Avatar } from "@mui/material";

import dayjs from "dayjs";
import { alpha, useTheme } from "@mui/material/styles";
import {
    Pattern, QrCode, SendToMobile, CreditCard, MoreHoriz, CheckCircle, CheckCircleOutline,
    HourglassEmpty, Cancel, ErrorOutline, Replay, Autorenew,
    TrendingUpRounded, ReceiptLongRounded, PendingActionsRounded
} from "@mui/icons-material";

/* ───────── KPI 카드 ───────── */
export const CardStat = ({ icon, label, value, sub, onClick, variant = "plain", tone = "primary" }) => {

    const palette = {
        bg: (theme) => theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.02)
            : theme.palette.background.paper,
        fg: (theme) => theme.palette.primary.main,
        border: (theme) => alpha(theme.palette.primary.main, 0.35),
    };

    const IconSlot = (() => {
        if (icon === "gross") return TrendingUpRounded;
        if (icon === "fee") return ReceiptLongRounded;
        if (icon === "unsettled") return PendingActionsRounded;
        return TrendingUpRounded;
    })();

    return (
        <Paper
            elevation={2}
            onClick={onClick}
            sx={{
                p: 2.5, borderRadius: 3, width: "100%", height: "100%",
                cursor: onClick ? "pointer" : "default",
                "&:hover": onClick ? { boxShadow: 6, transform: "translateY(-1px)", transition: "all .15s ease" } : undefined,
                background: (t) => palette.bg(t),
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.7)}`,
                position: "relative",
                overflow: "hidden",
                "&:before": {
                    content: '""',
                    position: "absolute",
                    left: 0, top: 0, bottom: 0, width: 3,
                    background: (t) => palette.fg(t),
                    opacity: 0.9,
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                    variant="rounded"
                    sx={(theme) => ({
                        bgcolor: alpha(theme.palette.primary.main, 0.10),
                        color: theme.palette.primary.main,
                        width: 44, height: 44, borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
                    })}
                >
                    <IconSlot />
                </Avatar>
                <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="body2" sx={{ color: (t) => alpha(t.palette.text.primary, 0.7) }} noWrap>
                        {label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.3px" }} noWrap>
                        {value}
                    </Typography>
                    {sub && (
                        <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.text.primary, 0.6) }} noWrap>
                            {sub}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};


export const Section = ({ title, actions, children }) => {

    const t = useTheme();
    return (
        <Paper elevation={1} sx={{
            p: 2.5, borderRadius: 3,
            bgcolor: t.palette.mode === 'dark' ? t.palette.background.default : t.palette.grey[50],
            border: 1,
            borderColor: t.palette.mode === 'dark' ? 'grey.900' : 'grey.300',
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={800}>{title}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">{actions}</Stack>
            </Stack>
            {children}
        </Paper>
    );
};

export const QuickRangeChips = ({ value, onChange }) => {
    const presets = [
        { key: "today", label: "오늘 하루", from: dayjs().startOf("day"), to: dayjs().endOf("day") },
        { key: "7d", label: "최근 7일", from: dayjs().subtract(6, "day").startOf("day"), to: dayjs().endOf("day") },
        { key: "month", label: "최근 4주", from: dayjs().startOf("month"), to: dayjs().endOf("month") },
    ];
    return (
        <Stack direction="row" spacing={1}>
            {presets.map((p) => (
                <Chip
                    key={p.key}
                    size="small"
                    label={p.label}
                    color={value?.key === p.key ? "primary" : "default"}
                    onClick={() => onChange({ key: p.key, from: p.from, to: p.to })}
                    variant={value?.key === p.key ? "filled" : "outlined"}
                />
            ))}
        </Stack>
    );
};

export const QuickTrendChips = ({ value, onChange }) => {
    const presets = [
        { key: "7d", label: "최근 7일" },
        { key: "8w", label: "최근 8주" },
        { key: "6m", label: "최근 6개월" },
    ];
    return (
        <Stack direction="row" spacing={1}>
            {presets.map((p) => (
                <Chip
                    key={p.key}
                    size="small"
                    label={p.label}
                    color={value === p.key ? "primary" : "default"}
                    onClick={() => onChange(p.key)}
                    variant={value === p.key ? "filled" : "outlined"}
                />
            ))}
        </Stack>
    );
};


// 연한 배경 + 컬러 텍스트
function SoftChipHex({ hex, icon, label, title }) {
    return (
        <Chip
            size="small"
            icon={icon}
            label={label}
            title={title}
            variant="outlined"
            sx={{
                bgcolor: alpha(hex, 0.16),
                color: hex,
                borderColor: "transparent",
                fontWeight: 600,
                pl: 1,
                pr: 1,
                letterSpacing: "-0.2px",
                "& .MuiChip-icon": { color: hex },
            }}
        />
    );
}

//결제수단 매핑용.
const METHOD_META = {
    kakaopay: { label: "카카오페이", icon: <QrCode /> },
    tosspay: { label: "토스페이", icon: <Pattern /> },
    danal: { label: "신용카드", icon: <CreditCard /> },
    phone: { label: "휴대폰결제", icon: <SendToMobile /> }, // 기타로 분류
    _: { label: "기타결제", icon: <MoreHoriz /> },
};


//결제상태 매핑용.
const STATUS_META = {
    ALLCOMPLETED: { label: "전체완료", icon: <CheckCircle /> },
    COMPLETED: { label: "결제완료", icon: <CheckCircleOutline /> },
    PROCESSING: { label: "처리중", icon: <Autorenew /> },
    PENDING: { label: "대기", icon: <HourglassEmpty /> },
    CANCELLED: { label: "취소", icon: <Cancel /> },
    FAILED: { label: "실패", icon: <ErrorOutline /> },
    REFUNDED: { label: "환불", icon: <Replay /> },
    _: { label: "알수없음", icon: <ErrorOutline /> },
};

export function PaymentMethodChip({ method }) {
    const m = METHOD_META[method] || METHOD_META._;
    return <SoftChipHex hex={'#58A0C8'} icon={m.icon} label={m.label} title={String(method)} />;
}

export function PaymentStatusChip({ status }) {
    const s = STATUS_META[status] || STATUS_META._;
    return <SoftChipHex hex={'#58A0C8'} icon={s.icon} label={s.label} title={String(status)} />;
}

