// src/pages/admin/UserList.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
    TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
    MenuItem, Typography, CircularProgress, Card, CardContent, Divider,
    IconButton, useTheme, useMediaQuery, CardActions, Stack, Chip
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { adminHttp } from "../../api/admin/http";

const roles = ["ADMIN", "COMPANY", "DRIVER", "ETC", "MANAGER"];
const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a4de6c"];

const formatYM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const addMonths = (ym, delta) => {
    const [y, m] = ym.split("-").map(Number);
    return formatYM(new Date(y, m - 1 + delta, 1));
};

export default function UserList() {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

    // ===== 목록 상태 =====
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // ===== 폼 =====
    const [open, setOpen] = useState(false);
    const emptyForm = {
        userId: null, loginId: "", name: "", email: "",
        pnumber: "", account: "", businessN: "", birthday: "", role: "COMPANY"
    };
    const [form, setForm] = useState(emptyForm);

    // ===== 통계 =====
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [month, setMonth] = useState(() => formatYM(new Date()));

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await adminHttp.get("/users", { params: { q, page, size } });
                setRows(data.content || []);
                setTotal(data.totalElements ?? 0);
            } finally { setLoading(false); }
        })();
    }, [q, page, size]);

    useEffect(() => {
        (async () => {
            setStatsLoading(true);
            try {
                const { data } = await adminHttp.get("/users/stats", { params: { month } });
                setStats(data);
            } finally { setStatsLoading(false); }
        })();
    }, [month]);

    const onSave = async () => {
        const payload = {
            loginId: form.loginId?.trim(),
            name: form.name?.trim(),
            email: form.email?.trim(),
            pnumber: form.pnumber?.trim() || "",
            account: form.account?.trim() || "",
            businessN: form.businessN?.trim() || "",
            birthday: form.birthday || "",
            role: form.role
        };
        if (!payload.loginId || !payload.name || !payload.email) {
            alert("로그인ID, 이름, 이메일은 필수입니다.");
            return;
        }
        try {
            if (form.userId) await adminHttp.put(`/users/${form.userId}`, payload);
            else await adminHttp.post("/users", payload);
            setOpen(false); setForm(emptyForm);
            const [list, stat] = await Promise.all([
                adminHttp.get("/users", { params: { q, page, size } }),
                adminHttp.get("/users/stats", { params: { month } }),
            ]);
            setRows(list.data.content || []);
            setTotal(list.data.totalElements ?? 0);
            setStats(stat.data);
        } catch (err) {
            alert(err?.response?.data?.message || "저장 실패");
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        await adminHttp.delete(`/users/${id}`);
        const [list, stat] = await Promise.all([
            adminHttp.get("/users", { params: { q, page, size } }),
            adminHttp.get("/users/stats", { params: { month } }),
        ]);
        setRows(list.data.content || []);
        setTotal(list.data.totalElements ?? 0);
        setStats(stat.data);
    };

    // ===== 차트 데이터 =====
    const dailyData = useMemo(
        () => (stats?.dailySignups || []).map(d => ({ day: d.date?.slice(8) ?? d.date, count: d.count })),
        [stats]
    );
    const roleData = useMemo(
        () => stats?.countsByRole ? Object.entries(stats.countsByRole).map(([role, value]) => ({ role, value })) : [],
        [stats]
    );

    const Kpi = ({ label, value }) => (
        <Card variant="outlined" sx={{ minHeight: 96, height: "100%" }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" mt={0.5}>
                    {value?.toLocaleString?.() ?? value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2, maxWidth: 1600, mx: "auto" }}>
            {/* 상단 툴바 */}
            <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={12} md="auto">
                    <Typography variant="h6" fontWeight={700}>회원 관리</Typography>
                </Grid>
                <Grid item xs />
                <Grid item xs="auto" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton size="small" onClick={() => setMonth(m => addMonths(m, -1))} aria-label="이전">
                        <ArrowBackIosNewIcon fontSize="inherit" />
                    </IconButton>
                    <TextField type="month" size="small" value={month} onChange={e => setMonth(e.target.value)} />
                    <IconButton size="small" onClick={() => setMonth(m => addMonths(m, +1))} aria-label="다음">
                        <ArrowForwardIosIcon fontSize="inherit" />
                    </IconButton>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* 대시보드 */}
            <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>대시보드</Typography>

                    {statsLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}><CircularProgress /></Box>
                    ) : (
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                                alignItems: "stretch",
                                gridTemplateColumns: {
                                    xs: "repeat(2, minmax(150px, 1fr))",
                                    sm: "repeat(auto-fit, minmax(220px, 1fr))",
                                },
                            }}
                        >
                            <Kpi label="전체 회원" value={stats?.totalUsers ?? 0} />
                            <Kpi label="신규(선택 월)" value={stats?.newUsersThisMonth ?? 0} />
                            <Kpi label="오늘 접속" value={stats?.activeToday ?? 0} />

                            {/* 파이차트 */}
                            <Card variant="outlined" sx={{ minHeight: 220, height: "100%", ...(isSmDown && { gridColumn: "1 / -1" }) }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" mb={1}>역할별 분포</Typography>
                                    {roleData.length === 0 ? (
                                        <Typography color="text.secondary">데이터 없음</Typography>
                                    ) : (
                                        <Box sx={{ width: "100%", height: { xs: 220, sm: 240, md: 220 } }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Tooltip />
                                                    <Legend verticalAlign="bottom" height={24} />
                                                    <Pie data={roleData} dataKey="value" nameKey="role" outerRadius={75} label>
                                                        {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 막대차트 */}
                            <Card variant="outlined" sx={{ gridColumn: "1 / -1", minHeight: 260 }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" mb={1}>{month} 가입 추이</Typography>
                                    {dailyData.length === 0 ? (
                                        <Typography color="text.secondary">데이터 없음</Typography>
                                    ) : (
                                        <Box sx={{ width: "100%", height: { xs: 240, sm: 260 } }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dailyData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="count" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 검색 + 버튼 영역 */}
            <Box
                mb={2}
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr auto auto" },
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <TextField
                    size="small"
                    placeholder="이름/이메일/로그인ID/전화 검색"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <Button variant="contained" onClick={() => setPage(0)}>검색</Button>
                <Button variant="contained" onClick={() => { setForm(emptyForm); setOpen(true); }}>
                    + 회원 추가
                </Button>
            </Box>

            {/* 목록: 모바일=카드 / 데스크톱=테이블 */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
            ) : (
                <>
                    {isSmDown ? (
                        <Stack spacing={1.5}>
                            {rows.length ? rows.map((u) => (
                                <Card key={u.userId} variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {u.name || "-"}
                                            </Typography>
                                            <Chip size="small" label={u.role || "-"} />
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                                            로그인ID: {u.loginId || "-"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">이메일: {u.email || "-"}</Typography>
                                        <Typography variant="body2" color="text.secondary">전화: {u.pnumber || "-"}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                            가입일: {u.regDate ?? "-"}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setForm({
                                                    userId: u.userId, loginId: u.loginId || "", name: u.name || "", email: u.email || "",
                                                    pnumber: u.pnumber || "", account: u.account || "", businessN: u.businessN || "",
                                                    birthday: u.birthday || "", role: u.role || "COMPANY"
                                                });
                                                setOpen(true);
                                            }}
                                        >
                                            수정
                                        </Button>
                                        <Button size="small" color="error" onClick={() => onDelete(u.userId)}>
                                            삭제
                                        </Button>
                                    </CardActions>
                                </Card>
                            )) : (
                                <Card variant="outlined"><CardContent sx={{ textAlign: "center", color: "text.secondary" }}>데이터가 없습니다.</CardContent></Card>
                            )}
                        </Stack>
                    ) : (
                        <>
                            <Box sx={{ width: "100%", overflowX: "auto" }}>
                                <Table sx={{ minWidth: 980 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>로그인ID</TableCell>
                                            <TableCell>이름</TableCell>
                                            <TableCell>이메일</TableCell>
                                            <TableCell>전화</TableCell>
                                            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>권한</TableCell>
                                            <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>가입일</TableCell>
                                            <TableCell width={180}>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.length ? rows.map(u => (
                                            <TableRow key={u.userId}>
                                                <TableCell>{u.userId}</TableCell>
                                                <TableCell>{u.loginId}</TableCell>
                                                <TableCell>{u.name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>{u.pnumber}</TableCell>
                                                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{u.role}</TableCell>
                                                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{u.regDate ?? "-"}</TableCell>
                                                <TableCell>
                                                    <Button size="small" onClick={() => {
                                                        setForm({
                                                            userId: u.userId, loginId: u.loginId || "", name: u.name || "", email: u.email || "",
                                                            pnumber: u.pnumber || "", account: u.account || "", businessN: u.businessN || "",
                                                            birthday: u.birthday || "", role: u.role || "COMPANY"
                                                        });
                                                        setOpen(true);
                                                    }}>수정</Button>
                                                    <Button size="small" color="error" onClick={() => onDelete(u.userId)}>삭제</Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={8} align="center">데이터가 없습니다.</TableCell></TableRow>
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

            {/* 추가/수정 다이얼로그 */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{form.userId ? "회원 수정" : "회원 추가"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12} sm={6}><TextField label="로그인ID" required fullWidth value={form.loginId}
                            onChange={e => setForm({ ...form, loginId: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="이름" required fullWidth value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="이메일" required type="email" fullWidth value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="전화번호" fullWidth value={form.pnumber}
                            onChange={e => setForm({ ...form, pnumber: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="계좌번호" fullWidth value={form.account}
                            onChange={e => setForm({ ...form, account: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="사업자등록번호" fullWidth value={form.businessN}
                            onChange={e => setForm({ ...form, businessN: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="생년월일 (YYYY-MM-DD)" fullWidth value={form.birthday}
                            onChange={e => setForm({ ...form, birthday: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="권한" select fullWidth value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={onSave}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
