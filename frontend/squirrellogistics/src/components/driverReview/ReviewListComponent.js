import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Stack, Button,
    Rating, Divider, FormControl, InputLabel, Select, MenuItem,
    Grid,
    Collapse
} from "@mui/material";
import { fetchDriverReviews } from "../../api/deliveryRequest/deliveryAssignmentAPI";
import { useParams } from "react-router-dom";
import ReviewItemComponent from "./ReviewItemComponent";
import LoadingComponent from "../../components/common/LoadingComponent";

const makeFallbackPage = (driverId, size) => {
    const content = [
        {
            reviewId: 101,
            rating: 4,
            reason:
                "유리 화병 80개 모두 손상 없이 배송 완료 확인했습니다. 사전에 전화로 주의사항 확인해주셔서 좋았어요. 감사합니다!",
            regDate: "2025-08-01 10:12:00",
            modiDate: null,
            stateEnum: "SUBMITTED",
            assignedId: 9001,
            driverId: Number(driverId) || 1,
            driverName: "샘플 기사",
            companyId: 1,
        },
        {
            reviewId: 102,
            rating: 5,
            reason: "정확하고 친절한 응대 감사합니다. 다음에도 부탁드릴게요.",
            regDate: "2025-07-28 09:00:00",
            modiDate: null,
            stateEnum: "SUBMITTED",
            assignedId: 9002,
            driverId: Number(driverId) || 1,
            driverName: "샘플 기사",
            companyId: 2,
        },
    ];

    return {
        content,
        number: 0,              // 현재 페이지(0-based)
        size,                   // 페이지 크기
        totalElements: content.length,
        totalPages: 1,
        first: true,
        last: true,
        empty: content.length === 0,
    };
};

export default function ReviewListComponent() {

    const { driverId } = useParams();
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [expanded, setExpanded] = useState(() => new Set());

    //DB데이터 연동.
    useEffect(() => {
        if (!driverId) return;
        const ctrl = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr("");
                let res = await fetchDriverReviews(
                    driverId,
                    { page: page - 1, size },
                    { signal: ctrl.signal }
                );

                // content가 비었으면 더미 페이지 세팅
                if (!res || !Array.isArray(res.content) || res.content.length === 0) {
                    res = makeFallbackPage(driverId, size);
                }
                setData(res);
                setExpanded(new Set());
            } catch (e) {
                setErr("리뷰를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
        return () => ctrl.abort();
    }, [driverId, page, size]);

    const content = useMemo(() => {
        const arr = data?.content ?? [];
        switch (sort) {
            case "ratingDesc":
                return [...arr].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || new Date(b.regDate) - new Date(a.regDate));
            case "ratingAsc":
                return [...arr].sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0) || new Date(b.regDate) - new Date(a.regDate));
            case "latest":
            default:
                return [...arr].sort((a, b) => new Date(b.regDate) - new Date(a.regDate));
        }
    }, [data, sort]);

    const totalPages = data?.totalPages ?? 0;

    const toggle = (id) => {
        setExpanded((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Grid
                sx={{
                    background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    minHeight: 160
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    pt={4}
                    gutterBottom
                    sx={{ fontFamily: 'inherit', fontSize: '2.0rem', fontWeight: 'bold', color: '#2A2A2A', m: 0 }}
                >
                    사용자 리뷰
                </Typography>

                {/* 정렬/페이지크기 선택 */}
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={4} mb={0} mr={4}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel id="size-label">페이지 크기</InputLabel>
                        <Select
                            labelId="size-label"
                            value={size}
                            label="페이지 크기"
                            onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
                        >
                            {[5, 10, 20].map(s => <MenuItem key={s} value={s}>{s}개</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="sort-label">정렬</InputLabel>
                        <Select
                            labelId="sort-label"
                            value={sort}
                            label="정렬"
                            onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        >
                            <MenuItem value="latest">최신 등록</MenuItem>
                            <MenuItem value="ratingDesc">별점 높은 순</MenuItem>
                            <MenuItem value="ratingAsc">별점 낮은 순</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Grid>

            {/* 에러 메시지 */}
            {err && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                    {err}
                </Typography>
            )}

            {/* 리스트 */}
            <Grid container direction="column" spacing={1.5} width="80%" sx={{ m: "0 auto", mt: 2 }}>
                {(content ?? []).map((r) => (
                    <Grid item key={r.reviewId}>
                        <ReviewItemComponent
                            review={r}
                            expanded={expanded.has(r.reviewId)}
                            onToggle={() => toggle(r.reviewId)}
                        />
                    </Grid>
                ))}
                {!loading && (content ?? []).length === 0 && (
                    <Typography align="center" sx={{ color: '#6b7785', py: 6 }}>
                        표시할 리뷰가 없습니다.
                    </Typography>
                )}
            </Grid>

            {/* 페이지네이션(간단 버튼) */}
            {totalPages > 0 && (
                <Stack direction="row" spacing={1.5} justifyContent="center" mt={3} mb={6}>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        이전
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
                        <Button
                            key={pn}
                            size="small"
                            variant={pn === page ? "contained" : "outlined"}
                            onClick={() => setPage(pn)}
                        >
                            {pn}
                        </Button>
                    ))}
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        다음
                    </Button>
                </Stack>
            )}

            {/* 로딩 모달 */}
            {loading && <LoadingComponent open text="리뷰를 불러오는 중..." />}
        </Box>
    );
}