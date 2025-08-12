import React, { useMemo, useState } from "react";
import {
    Box, Paper, Typography, Stack, Button,
    Rating, Divider, FormControl, InputLabel, Select, MenuItem,
    Grid,
    Collapse
} from "@mui/material";

const DUMMY_REVIEWS = [
    {
        id: 101, rating: 4,
        createdAt: "2025-08-01T10:12:00Z", updatedAt: "2025-08-01T10:12:00Z",
        content: "유리 화병 80개 모두 손상 없이 배송 완료되었다 연락 받았습니다. 사전에 전화로 주의사항 확인해주셔서 좋았어요. 감사합니다^^!",
        transportId: "TR-20250801-001",
        photos: ["https://picsum.photos/seed/r101a/800/600", "https://picsum.photos/seed/r101b/800/600"]
    },
    {
        id: 102, rating: 2,
        createdAt: "2025-07-28T08:40:00Z", updatedAt: "2025-07-28T09:05:00Z",
        content: "약속 시간보다 2시간 지연... 심지어 아무 연락 없음... 포장 상태도 불량, 다음에는 이용하지 않을 예정입니다~",
        transportId: "TR-20250728-023",
        photos: ["https://picsum.photos/seed/r102a/900/600", "https://picsum.photos/seed/r102b/900/600", "https://picsum.photos/seed/r102c/900/600"]
    },
    { id: 103, rating: 5, createdAt: "2025-07-20T12:00:00Z", updatedAt: "2025-07-20T12:00:00Z", content: "신속하고 정확합니다. 기사님 응대도 좋았습니다.", transportId: "TR-20250720-007", photos: [] },
    { id: 104, rating: 4, createdAt: "2025-07-18T16:30:00Z", updatedAt: "2025-07-18T16:30:00Z", content: "빠르고 좋아요. 감사합니다.", transportId: "TR-20250718-014", photos: ["https://picsum.photos/seed/r104/800/600"] },
    { id: 105, rating: 3, createdAt: "2025-07-15T09:20:00Z", updatedAt: "2025-07-15T10:00:00Z", content: "보통이었습니다. 시간 준수는 좋았고 포장 마감은 아쉬웠습니다.", transportId: "TR-20250715-031", photos: [] },
];

/** ===== 유틸 ===== */
const textSx = { fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif', color: '#2A2A2A', fontSize: 'clamp(14px, 1vw, 16px)' };
const fmtDate = (iso) => new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
const snippet = (s, n = 15) => (s?.length > n ? s.slice(0, n) + '…' : s ?? "");

/** ===== 리뷰 아이템 (펼치면 큰 이미지) ===== */
function ReviewItem({ review, expanded, onToggle }) {
    const hasThumb = (review.photos?.length ?? 0) > 0;
    const firstThumb = hasThumb ? review.photos[0] : null;

    console.log(hasThumb);
    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2,borderColor:"#bbc5d0", width: "100%", boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)' }}>
            {/* 상단: 별점/날짜/미리보기/펼치기 버튼 */}
            <Grid container direction="row" alignItems="flex-start" justifyContent="space-between" width={"100%"}>
                <Box flex={1} minWidth={0}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Rating value={review.rating} precision={0.5} readOnly size="medium"
                            sx={{
                                '& .MuiRating-iconFilled': { color: '#113F67' },
                                '& .MuiRating-iconEmpty': { color: '#bbc5d0' },
                            }} />
                        <Typography sx={textSx} fontWeight={700}>{review.rating}</Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography sx={{ ...textSx, color: '#6b7785' }}>등록일 {fmtDate(review.createdAt)}</Typography>
                    </Stack>

                    <Typography sx={{ ...textSx, whiteSpace: 'pre-line' }} mt={2}>
                        {expanded ? review.content : snippet(review.content, 15)}
                    </Typography>
                </Box>

                {/* 우측 썸네일 (접힘 상태에서만 노출) */}
                <Grid container direction={"column"} justifyContent={"center"} sx={{ minWidth: 64 }}>
                    <Grid item alignSelf={"center"}>
                        <Button
                            variant="text" size="small" onClick={onToggle}
                            sx={{ minWidth: 0, p: 0, color: '#113F67', fontWeight: 600, }}
                        >
                            {expanded ? '접기' : '펼치기'}
                        </Button>
                    </Grid>

                    {!expanded && hasThumb && (
                        <Grid item alignSelf={"center"}
                            sx={{
                                width: 36, height: 36, mt: 1, borderRadius: 1, border: '1px solid #c9d3df',
                                bgcolor: hasThumb ? 'transparent' : '#E0E6ED', overflow: 'hidden'
                            }}
                        >
                            {hasThumb && (
                                <Box component="img" src={firstThumb} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {/* 펼친 영역: 큰 이미지 그리드 + 추가 정보 */}
            <Collapse in={expanded} timeout={200} unmountOnExit>
                <Box mt={1.5}>
                    {hasThumb && (
                        <Grid container spacing={1} justifyContent={"space-evenly"}>
                            {review.photos.map((src, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                    <Box
                                        component="img"
                                        src={src}
                                        alt={`review-${review.id}-${idx}`}
                                        sx={{
                                            width: '100%', height: 220, objectFit: 'cover',
                                            borderRadius: 1.2, border: '1px solid #c9d3df'
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    <Typography sx={{ ...textSx, color: '#6b7785' }} mt={1}>
                        대상 운송 ID: {review.transportId}
                    </Typography>
                </Box>
            </Collapse>
        </Paper>
    );
}

/** ===== 페이지 ===== */
export default function ReviewListComponent() {
    const [sort, setSort] = useState('latest'); // latest | ratingDesc | ratingAsc
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(() => new Set()); // 펼침 상태(id 저장)
    const pageSize = 4;

    const sorted = useMemo(() => {
        const arr = [...DUMMY_REVIEWS];
        switch (sort) {
            case 'ratingDesc':
                return arr.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
            case 'ratingAsc':
                return arr.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
            case 'latest':
            default:
                return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }, [sort]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const current = sorted.slice((page - 1) * pageSize, page * pageSize);

    const toggle = (id) => {
        setExpanded(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Grid width={"100%"}
                sx={{
                    background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    minHeight: 160
                }}
            >
                <Typography variant="h4" align="center" pt={4} gutterBottom
                    sx={{
                        fontFamily: 'inherit', fontSize: '2.0rem',
                        fontWeight: 'bold',
                        color: '#2A2A2A',
                        margin: 0
                    }}>사용자 리뷰
                </Typography>

                {/* 정렬 */}
                <Stack direction="row" justifyContent="flex-end" mt={4} mb={0} mr={4}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="sort-label">정렬</InputLabel>
                        <Select
                            labelId="sort-label"
                            label="정렬"
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        >
                            <MenuItem value="latest">최신 등록</MenuItem>
                            <MenuItem value="ratingDesc">별점 높은 순</MenuItem>
                            <MenuItem value="ratingAsc">별점 낮은 순</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Grid>



            {/* 리스트 */}
            <Grid container direction={"column"} justifyContent={"center"} justifySelf={"center"} spacing={1.5} width={"80%"}>
                {current.map(r => (
                    <Grid item >
                        <ReviewItem
                            key={r.id}
                            review={r}
                            expanded={expanded.has(r.id)}
                            onToggle={() => toggle(r.id)}
                        />
                    </Grid>

                ))}
            </Grid>

            {/* 페이지네이션 (간단 버튼) */}
            <Stack direction="row" spacing={1.5} justifyContent="center" mt={3}>
                <Button variant="outlined" size="small" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    이전
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pn => (
                    <Button
                        key={pn}
                        size="small"
                        variant={pn === page ? "contained" : "outlined"}
                        onClick={() => setPage(pn)}
                    >
                        {pn}
                    </Button>
                ))}
                <Button variant="outlined" size="small" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    다음
                </Button>
            </Stack>
        </Box>
    );
}