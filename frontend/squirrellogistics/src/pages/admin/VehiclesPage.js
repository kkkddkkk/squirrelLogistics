// src/pages/admin/VehiclesPage.jsx
import { useEffect, useState } from "react";
import {
    Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography,
    CircularProgress, TablePagination, useTheme, useMediaQuery,
    Card, CardContent, CardActions, Stack, Chip
} from "@mui/material";
import { adminHttp } from "../../api/admin/http";

export default function VehiclesPage() {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

    // 차량 "종류" 목록
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const emptyForm = { vehicleTypeId: null, name: "", maxWeight: "", adminId: "" };
    const [form, setForm] = useState(emptyForm);

    const fetchList = async () => {
        setLoading(true);
        try {
            const { data } = await adminHttp.get("/vehicle-types", { params: { q, page, size } });
            setRows(data.content || []);
            setTotal(data.totalElements ?? 0);
        } catch (err) {
            console.error("차량종류 목록 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, [q, page, size]);

    const onSave = async () => {
        const payload = {
            adminId: form.adminId ? Number(form.adminId) : null,
            name: form.name?.trim(),
            maxWeight: form.maxWeight !== "" ? Number(form.maxWeight) : 0,
        };

        if (!payload.adminId) { alert("관리자 ID는 필수입니다."); return; }
        if (!payload.name) { alert("차량 종류명을 입력하세요."); return; }

        try {
            if (form.vehicleTypeId) {
                await adminHttp.put(`/vehicle-types/${form.vehicleTypeId}`, payload);
            } else {
                await adminHttp.post("/vehicle-types", payload);
            }
            setOpen(false);
            setForm(emptyForm);
            fetchList();
        } catch (err) {
            alert(err?.response?.data?.message || "저장 실패");
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await adminHttp.delete(`/vehicle-types/${id}`);
            fetchList();
        } catch (err) {
            alert("삭제 실패");
        }
    };

    return (
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2, maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                차량 종류 관리
            </Typography>

            {/* 액션바: 모바일 1열 / 데스크톱 2열 */}
            <Box
                mb={2}
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "auto auto 1fr auto" },
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <TextField
                    size="small"
                    placeholder="종류명 검색"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    sx={{ minWidth: { xs: "100%", sm: 220 } }}
                />
                <Button
                    variant="contained"
                    onClick={fetchList}
                    sx={{ justifySelf: { xs: "stretch", sm: "start" } }}
                >
                    검색
                </Button>
                <Box sx={{ display: { xs: "none", sm: "block" } }} />
                <Button
                    variant="contained"
                    onClick={() => { setForm(emptyForm); setOpen(true); }}
                    sx={{ justifySelf: { xs: "stretch", sm: "end" } }}
                >
                    + 차량 종류 등록
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* 모바일: 카드 리스트 */}
                    {isSmDown ? (
                        <Stack spacing={1.5}>
                            {rows.length ? rows.map((v) => (
                                <Card key={v.vehicleTypeId} variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {v.name}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                color="primary"
                                                label={`${(v.maxWeight ?? 0).toLocaleString()} kg`}
                                                variant="outlined"
                                            />
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                                            ID: {v.vehicleTypeId}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                            관리자: {v.adminUserDTO ? `${v.adminUserDTO.name ?? "-"} (ID: ${v.adminUserDTO.adminId})` : "-"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            등록일: {v.regDate ?? "-"}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setForm({
                                                    vehicleTypeId: v.vehicleTypeId,
                                                    name: v.name ?? "",
                                                    maxWeight: v.maxWeight ?? "",
                                                    adminId: v.adminUserDTO?.adminId ?? "",
                                                });
                                                setOpen(true);
                                            }}
                                        >
                                            수정
                                        </Button>
                                        <Button size="small" color="error" onClick={() => onDelete(v.vehicleTypeId)}>
                                            삭제
                                        </Button>
                                    </CardActions>
                                </Card>
                            )) : (
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: "center", color: "text.secondary" }}>
                                        데이터가 없습니다.
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    ) : (
                        // 데스크톱: 테이블 + 반응형 컬럼 숨김 + 가로 스크롤
                        <>
                            <Box sx={{ width: "100%", overflowX: "auto" }}>
                                <Table sx={{ minWidth: 980 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>종류명</TableCell>
                                            <TableCell>최대 적재량(kg)</TableCell>
                                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>관리자</TableCell>
                                            <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>등록일</TableCell>
                                            <TableCell width={200}>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.length ? rows.map((v) => (
                                            <TableRow key={v.vehicleTypeId}>
                                                <TableCell>{v.vehicleTypeId}</TableCell>
                                                <TableCell>{v.name}</TableCell>
                                                <TableCell>{(v.maxWeight ?? 0).toLocaleString()}</TableCell>
                                                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                                                    {v.adminUserDTO
                                                        ? `${v.adminUserDTO.name ?? "-"} (ID: ${v.adminUserDTO.adminId})`
                                                        : "-"}
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                                                    {v.regDate ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setForm({
                                                                vehicleTypeId: v.vehicleTypeId,
                                                                name: v.name ?? "",
                                                                maxWeight: v.maxWeight ?? "",
                                                                adminId: v.adminUserDTO?.adminId ?? "",
                                                            });
                                                            setOpen(true);
                                                        }}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button size="small" color="error" onClick={() => onDelete(v.vehicleTypeId)}>
                                                        삭제
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">데이터가 없습니다.</TableCell>
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

            {/* 등록/수정 다이얼로그 */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{form.vehicleTypeId ? "차량 종류 수정" : "차량 종류 등록"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12}>
                            <TextField
                                label="종류명 (예: 1톤 트럭)"
                                required
                                fullWidth
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="최대 적재량(kg)"
                                type="number"
                                fullWidth
                                value={form.maxWeight}
                                onChange={e => setForm({ ...form, maxWeight: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="관리자 ID"
                                type="number"
                                required
                                fullWidth
                                value={form.adminId}
                                onChange={e => setForm({ ...form, adminId: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={onSave}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
