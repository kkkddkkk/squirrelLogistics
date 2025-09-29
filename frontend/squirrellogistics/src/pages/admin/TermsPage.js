// src/pages/admin/TermsPage.jsx
import { useEffect, useState } from "react";
import {
    Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, Switch,
    FormControlLabel, Typography, CircularProgress, TablePagination,
    useTheme, useMediaQuery, Card, CardContent, CardActions, Stack, Chip
} from "@mui/material";
import { adminHttp } from "../../api/admin/http";

export default function TermsPage() {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState({ open: false, content: "" });

    const emptyForm = {
        termId: null,
        termName: "",
        termContent: "",
        isRequired: true,
        userId: "" // 선택값
    };
    const [form, setForm] = useState(emptyForm);

    const fetchList = async () => {
        setLoading(true);
        try {
            const { data } = await adminHttp.get("/terms", { params: { page, size } });
            setRows(data.content || []);
            setTotal(data.totalElements ?? 0);
        } catch (e) {
            console.error("약관 목록 조회 실패", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, [page, size]);

    const onSave = async () => {
        const payload = {
            termName: form.termName?.trim(),
            termContent: form.termContent ?? "",
            required: !!form.isRequired,
            userId: form.userId ? Number(form.userId) : null
        };

        if (!payload.termName) {
            alert("약관명을 입력하세요.");
            return;
        }

        try {
            if (form.termId) {
                await adminHttp.put(`/terms/${form.termId}`, payload);
            } else {
                await adminHttp.post("/terms", payload);
            }
            setOpen(false);
            setForm(emptyForm);
            fetchList();
        } catch (e) {
            alert(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await adminHttp.delete(`/terms/${id}`);
            fetchList();
        } catch (e) {
            alert("삭제 실패");
        }
    };

    return (
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2, maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                약관 관리
            </Typography>

            {/* 액션 바: 모바일 1열 / 데스크톱 우측 정렬 */}
            <Box
                mb={2}
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => { setForm(emptyForm); setOpen(true); }}
                    sx={{ justifySelf: { xs: "stretch", sm: "start" } }}
                >
                    + 약관 추가
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* 모바일: 카드 리스트 뷰 */}
                    {isSmDown ? (
                        <Stack spacing={1.5}>
                            {rows.length ? rows.map((t) => {
                                const required = t.required ?? t.isRequired ?? false;
                                return (
                                    <Card key={t.termId} variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {t.termName}
                                                </Typography>
                                                <Chip
                                                    label={required ? "필수" : "선택"}
                                                    color={required ? "error" : "default"}
                                                    size="small"
                                                    variant={required ? "filled" : "outlined"}
                                                />
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                ID: {t.termId} &nbsp;·&nbsp; 작성자: {t.userDTO ? `${t.userDTO.name ?? "-"} (${t.userDTO.userId})` : "-"}
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                                생성일 {t.createDT ?? "-"} &nbsp; | &nbsp; 수정일 {t.updateDT ?? "-"}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                            <Button size="small" onClick={() => setPreview({ open: true, content: t.termContent || "" })}>
                                                미리보기
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setForm({
                                                        termId: t.termId,
                                                        termName: t.termName ?? "",
                                                        termContent: t.termContent ?? "",
                                                        isRequired: t.isRequired ?? t.required ?? false,
                                                        userId: t.userDTO?.userId ?? ""
                                                    });
                                                    setOpen(true);
                                                }}
                                            >
                                                수정
                                            </Button>
                                            <Button size="small" color="error" onClick={() => onDelete(t.termId)}>
                                                삭제
                                            </Button>
                                        </CardActions>
                                    </Card>
                                );
                            }) : (
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: "center", color: "text.secondary" }}>
                                        데이터가 없습니다.
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    ) : (
                        // 데스크톱: 테이블 + 일부 컬럼 반응형 숨김
                        <>
                            <Box sx={{ width: "100%", overflowX: "auto" }}>
                                <Table sx={{ minWidth: 960 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>약관명</TableCell>
                                            <TableCell>필수</TableCell>
                                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>작성자</TableCell>
                                            <TableCell>생성일</TableCell>
                                            <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>수정일</TableCell>
                                            <TableCell width={260}>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.length ? rows.map((t) => {
                                            const required = t.required ?? t.isRequired ?? false;
                                            return (
                                                <TableRow key={t.termId}>
                                                    <TableCell>{t.termId}</TableCell>
                                                    <TableCell>{t.termName}</TableCell>
                                                    <TableCell>{required ? "예" : "아니오"}</TableCell>
                                                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                                                        {t.userDTO ? `${t.userDTO.name ?? "-"} (${t.userDTO.userId})` : "-"}
                                                    </TableCell>
                                                    <TableCell>{t.createDT ?? "-"}</TableCell>
                                                    <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{t.updateDT ?? "-"}</TableCell>
                                                    <TableCell>
                                                        <Button size="small" onClick={() => setPreview({ open: true, content: t.termContent || "" })}>
                                                            미리보기
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setForm({
                                                                    termId: t.termId,
                                                                    termName: t.termName ?? "",
                                                                    termContent: t.termContent ?? "",
                                                                    isRequired: t.isRequired ?? t.required ?? false,
                                                                    userId: t.userDTO?.userId ?? ""
                                                                });
                                                                setOpen(true);
                                                            }}
                                                        >
                                                            수정
                                                        </Button>
                                                        <Button size="small" color="error" onClick={() => onDelete(t.termId)}>
                                                            삭제
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>

                            <TablePagination
                                component="div"
                                count={total}
                                page={page}
                                onPageChange={(e, p) => setPage(p)}
                                rowsPerPage={size}
                                onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
                                rowsPerPageOptions={[10, 20, 50]}
                            />
                        </>
                    )}
                </>
            )}

            {/* 약관 추가/수정 다이얼로그 */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{form.termId ? "약관 수정" : "약관 추가"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="약관명"
                                required
                                fullWidth
                                value={form.termName}
                                onChange={e => setForm({ ...form, termName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!form.isRequired}
                                        onChange={e => setForm({ ...form, isRequired: e.target.checked })}
                                    />
                                }
                                label="필수 약관"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="작성자 사용자 ID (선택)"
                                type="number"
                                fullWidth
                                value={form.userId}
                                onChange={e => setForm({ ...form, userId: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="약관 내용"
                                fullWidth
                                multiline
                                minRows={10}
                                value={form.termContent}
                                onChange={e => setForm({ ...form, termContent: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={onSave}>저장</Button>
                </DialogActions>
            </Dialog>

            {/* 미리보기 다이얼로그 */}
            <Dialog
                open={preview.open}
                onClose={() => setPreview({ open: false, content: "" })}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>미리보기</DialogTitle>
                <DialogContent>
                    <Box sx={{ whiteSpace: "pre-wrap" }}>{preview.content}</Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreview({ open: false, content: "" })}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
