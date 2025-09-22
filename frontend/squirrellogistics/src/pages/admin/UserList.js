import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody,
    TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
    MenuItem, Typography, CircularProgress, Card, CardContent, Divider, Chip,
    IconButton
} from "@mui/material";
import { adminHttp } from "../../api/admin/http";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from "recharts";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const roles = ["ADMIN", "COMPANY", "DRIVER", "ETC", "MANAGER"];
const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a4de6c"];

const formatYM = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
};
const addMonths = (ym, delta) => {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return formatYM(d);
};

export default function UserList() {
    // ===== 목록 상태 =====
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // ===== 폼 상태 =====
    const [open, setOpen] = useState(false);
    const emptyForm = {
        userId: null, loginId: "", name: "", email: "",
        pnumber: "", account: "", businessN: "", birthday: "", role: "COMPANY"
    };
    const [form, setForm] = useState(emptyForm);

    // ===== 통계 상태 =====
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [month, setMonth] = useState(() => formatYM(new Date())); // YYYY-MM

    // ===== 목록 로딩 =====
    const fetchList = async () => {
        setLoading(true);
        try {
            const { data } = await adminHttp.get("/users", { params: { q, page, size } });
            setRows(data.content || []);
            setTotal(data.totalElements ?? 0);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchList(); }, [q, page, size]);

    // ===== 통계 로딩 (월 선택 반영) =====
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const { data } = await adminHttp.get("/users/stats", { params: { month } }); // yyyy-MM
            setStats(data);
        } finally {
            setStatsLoading(false);
        }
    };
    useEffect(() => { fetchStats(); }, [month]);

    // ===== 저장/삭제 =====
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
            setOpen(false);
            setForm(emptyForm);
            fetchList();
            fetchStats(); // 데이터 변화 → 통계 갱신
        } catch (err) {
            alert(err?.response?.data?.message || "저장 실패");
        }
    };

    const onDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        await adminHttp.delete(`/users/${id}`);
        fetchList();
        fetchStats();
    };

    // ===== 그래프 데이터 가공 =====
    const dailyData = useMemo(() => (
        (stats?.dailySignups || []).map(d => ({
            // d.date가 "yyyy-MM-dd"라고 가정 → x축엔 'dd'만 표시하면 가독성 ↑
            day: d.date?.slice(8) ?? d.date,
            count: d.count
        }))
    ), [stats]);

    const roleData = useMemo(() => (
        stats?.countsByRole
            ? Object.entries(stats.countsByRole).map(([role, value]) => ({ role, value }))
            : []
    ), [stats]);

    // ===== KPI 카드 =====
    const Kpi = ({ label, value, suffix }) => (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" mt={0.5}>
                    {value?.toLocaleString?.() ?? value}{suffix || ""}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Typography variant="h6" mb={2}>회원 관리</Typography>

            <Grid container spacing={2}>
                {/* ===== 좌측: 대시보드/그래프 ===== */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                                대시보드
                            </Typography>

                            {/* 이전/다음 월 */}
                            <IconButton size="small" onClick={() => setMonth(m => addMonths(m, -1))}>
                                <ArrowBackIosNewIcon fontSize="inherit" />
                            </IconButton>

                            <TextField
                                type="month"
                                size="small"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                            <IconButton size="small" onClick={() => setMonth(m => addMonths(m, +1))}>
                                <ArrowForwardIosIcon fontSize="inherit" />
                            </IconButton>
                        </CardContent>
                        <Divider />
                    </Card>

                    {statsLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Kpi label="전체 회원" value={stats?.totalUsers ?? 0} />
                            <Kpi label="신규(선택 월)" value={stats?.newUsersThisMonth ?? 0} />
                            <Kpi label="오늘 접속" value={stats?.activeToday ?? 0} />

                            {/* 역할별 분포 - 파이차트 */}
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" mb={1}>역할별 분포</Typography>
                                    {roleData.length === 0 ? (
                                        <Typography color="text.secondary">데이터 없음</Typography>
                                    ) : (
                                        <Box sx={{ height: 220 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Tooltip />
                                                    <Legend verticalAlign="bottom" height={24} />
                                                    <Pie data={roleData} dataKey="value" nameKey="role" outerRadius={70} label>
                                                        {roleData.map((_, idx) => (
                                                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 선택 월 가입 추이 - 막대 그래프 */}
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        {month} 가입 추이
                                    </Typography>
                                    {dailyData.length === 0 ? (
                                        <Typography color="text.secondary">데이터 없음</Typography>
                                    ) : (
                                        <Box sx={{ height: 220 }}>
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
                        </>
                    )}
                </Grid>

                {/* ===== 우측: 목록/검색 ===== */}
                <Grid item xs={12} md={9}>
                    <Box mb={2} display="flex" gap={1}>
                        <TextField
                            size="small"
                            placeholder="이름/이메일/로그인ID/전화 검색"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <Button variant="contained" onClick={fetchList}>검색</Button>
                        <Box flex={1} />
                        <Button variant="contained" onClick={() => { setForm(emptyForm); setOpen(true); }}>
                            + 회원 추가
                        </Button>
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>로그인ID</TableCell>
                                        <TableCell>이름</TableCell>
                                        <TableCell>이메일</TableCell>
                                        <TableCell>전화</TableCell>
                                        <TableCell>권한</TableCell>
                                        <TableCell>가입일</TableCell>
                                        <TableCell width={180}>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.length > 0 ? rows.map((u) => (
                                        <TableRow key={u.userId}>
                                            <TableCell>{u.userId}</TableCell>
                                            <TableCell>{u.loginId}</TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.pnumber}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>{u.regDate ?? "-"}</TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => {
                                                    setForm({
                                                        userId: u.userId,
                                                        loginId: u.loginId || "",
                                                        name: u.name || "",
                                                        email: u.email || "",
                                                        pnumber: u.pnumber || "",
                                                        account: u.account || "",
                                                        businessN: u.businessN || "",
                                                        birthday: u.birthday || "",
                                                        role: u.role || "COMPANY"
                                                    });
                                                    setOpen(true);
                                                }}>수정</Button>
                                                <Button size="small" color="error" onClick={() => onDelete(u.userId)}>삭제</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">데이터가 없습니다.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

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
                </Grid>
            </Grid>

            {/* ===== 추가/수정 다이얼로그 ===== */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{form.userId ? "회원 수정" : "회원 추가"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="로그인ID" required fullWidth value={form.loginId}
                                onChange={e => setForm({ ...form, loginId: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="이름" required fullWidth value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="이메일" required type="email" fullWidth value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="전화번호" fullWidth value={form.pnumber}
                                onChange={e => setForm({ ...form, pnumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="계좌번호" fullWidth value={form.account}
                                onChange={e => setForm({ ...form, account: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="사업자등록번호" fullWidth value={form.businessN}
                                onChange={e => setForm({ ...form, businessN: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="생년월일 (YYYY-MM-DD)" fullWidth value={form.birthday}
                                onChange={e => setForm({ ...form, birthday: e.target.value })} />
                        </Grid>
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
