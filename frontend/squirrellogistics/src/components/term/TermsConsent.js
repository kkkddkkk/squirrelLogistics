// src/components/term/TermsConsent.jsx  (파일명은 권장, 기존 파일명이어도 함수 이름만 대문자면 OK)
import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Stack,
    Tooltip,
    Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/**
 * props
 * - terms: [{id, termName, termContent, required, createDT, updateDT}, ...]
 * - agreed: Set<number> | number[]
 * - onChange: (next:Set<number>) => void
 */
export default function TermsConsent({ terms = [], agreed = new Set(), onChange }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(null); // 현재 모달에 띄울 term

    const agreedSet = useMemo(
        () => (agreed instanceof Set ? agreed : new Set(agreed)),
        [agreed]
    );

    const requiredIds = useMemo(
        () => terms.filter((t) => !!t.required).map((t) => t.termId),
        [terms]
    );
    const requiredAllAgreed = useMemo(
        () => requiredIds.every((termId) => agreedSet.has(termId)),
        [requiredIds, agreedSet]
    );

    const openModal = (term) => {
        setActive(term);
        setOpen(true);
    };
    const closeModal = () => {
        setOpen(false);
        setActive(null);
    };

    const setAgree = (termId, yes) => {
        const next = new Set(agreedSet);
        if (yes) next.add(termId);
        else next.delete(termId);
        onChange?.(next);
    };

    const agreeFromModal = () => {
        if (!active) return;
        setAgree(active.termId, true);
        closeModal();
    };

    const unagreeFromModal = () => {
        if (!active) return;
        setAgree(active.termId, false);
        closeModal();
    };

    const agreeAll = () => {
        const next = new Set(terms.map((t) => t.termId)); // 선택 포함 전체 동의
        onChange?.(next);
    };

    return (
        <>
            {/* 상단 요약 */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    약관 동의
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        size="small"
                        label={requiredAllAgreed ? "필수 약관 동의 완료" : "필수 약관 동의 필요"}
                        color={requiredAllAgreed ? "success" : "warning"}
                        icon={<InfoOutlinedIcon />}
                        variant={requiredAllAgreed ? "filled" : "outlined"}
                    />
                    <Tooltip title="모든 약관(필수+선택)을 한 번에 동의합니다.">
                        <Button size="small" variant="outlined" onClick={agreeAll}>
                            전체 동의
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* 세로 목록 */}
            <Stack direction="column" spacing={1}>
                {terms.length === 0 ? (
                    <Typography variant="body2">
                        [약관 내용 삽입] 회원 이용 약관을 스크롤 가능한 영역에 표시합니다.
                    </Typography>
                ) : (
                    terms.map((t) => {
                        const isAgreed = agreedSet.has(t.termId);
                        return (
                            <Button
                                key={t.termId}
                                onClick={() => openModal(t)}
                                variant={isAgreed ? "contained" : "outlined"}
                                color={isAgreed ? "primary" : t.required ? "warning" : "inherit"}
                                startIcon={isAgreed ? <CheckCircleIcon /> : null}
                                sx={{
                                    justifyContent: "flex-start",
                                    gap: 1,
                                }}
                            >
                                <span>{t.termName}</span>
                                <span
                                    style={{
                                        color: t.required ? "#ff9800" : "#777",
                                        fontWeight: t.required ? "bold" : "normal",
                                    }}
                                >
                                    {t.required ? "(필수)" : "(선택)"}
                                </span>
                            </Button>
                        );
                    })
                )}
            </Stack>

            {/* 상세 모달 */}
            <Dialog open={open} onClose={closeModal} fullWidth maxWidth="md">
                <DialogTitle>
                    {active?.termName} {active?.required ? "(필수)" : "(선택)"}
                </DialogTitle>
                <DialogContent dividers sx={{ maxHeight: 500 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {active?.termContent}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    {active && (
                        agreedSet.has(active.termId) ? (
                            <>
                                <Button onClick={unagreeFromModal} variant="outlined" color="warning">
                                    동의 해제
                                </Button>
                                <Button onClick={closeModal}>닫기</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={agreeFromModal} variant="contained">
                                    동의하고 닫기
                                </Button>
                                <Button onClick={closeModal}>닫기</Button>
                            </>
                        )
                    )}
                    {!active && <Button onClick={closeModal}>닫기</Button>}
                </DialogActions>
            </Dialog>
        </>
    );
}
