import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { currency, isCompleted, autoCalcFee, paymentsService } from "./settlementUtilities";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PaymentMethodChip, PaymentStatusChip, QuickRangeChips } from "./SettlementCommonUI";
import { Calculate, CheckBox, Done, DoneAll, DoneOutlined, FilterList, LibraryAddCheckOutlined, Refresh, Summarize } from "@mui/icons-material";
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Pagination from "@mui/material/Pagination";
import { settlementApi } from "../../api/settlement/settlementAPI";
import LoadingComponent from "../common/LoadingComponent";

//기업, 운전자 각각 15%씩 각출 기획(추후 조정 가능).
const FEE_RATE = 0.30;
const FEE_PERCANT = FEE_RATE * 100;
const calc30 = (amount) => Math.round((Number(amount) || 0) * FEE_RATE);

const METHOD_LABEL = { kakaopay: "카카오페이", tosspay: "토스페이", danal: "신용카드", phone: "휴대폰 결제" };
const STATUS_LABEL = {
    PENDING: "결제 대기",
    PROCESSING: "결제 처리 중",
    COMPLETED: "1차 결제 완료",
    ALLCOMPLETED: "2차 결제 완료",
    FAILED: "결제 실패",
    CANCELLED: "결제 취소",
    REFUNDED: "환불 완료",
};


export default function UnsettledListComponent() {
    const [range, setRange] = useState({ key: "7d", from: dayjs().subtract(6, "day"), to: dayjs() });
    const [custom, setCustom] = useState({ from: null, to: null });
    const [method, setMethod] = useState("all");
    const [settle, setSettle] = useState("unsettled");
    const isUnsettledMode = settle === "unsettled";
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [selection, setSelection] = useState([]);
    const [feeEdit, setFeeEdit] = useState({});
    const [detail, setDetail] = useState(null);
    const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const t = useTheme();
    const isSmaller900 = useMediaQuery(t.breakpoints.down('md'));


    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchRows = useCallback(async () => {
        setLoading(true);
        try {
            const useCustom = Boolean(custom.from && custom.to);
            const from = (useCustom ? custom.from : range.from).startOf("day");
            const to = (useCustom ? custom.to : range.to).endOf("day");

            const res = await settlementApi.getPayments({
                from, to, method, settle, page, size, sortKey: "paid,DESC"
            });

            setRows(res.dtoList || []);
            setTotalPages(res.totalPage ?? 0);
            setTotalElements(res.totalCount ?? 0);

            if (res.current && res.current !== page) {
                setPage(res.current);
            }

            setSelection([]);
            setFeeEdit({});
        } finally {
            setLoading(false);
        }
    }, [range, custom, method, settle, page, size]);


    useEffect(() => { fetchRows(); }, [fetchRows]);

    // 기간 바뀌면 첫 페이지로.
    useEffect(() => { setPage(1); }, [range, custom, method]);
    // 정산 모드 바뀌면 첫 페이지 + UI모드 변경.
    useEffect(() => {
        setSelection([]);
        setFeeEdit({});
        setPage(1);
    }, [settle]);

    // 전체선택 토글(혹은 전체 선택 해제).
    const allSelected = rows.length > 0 && selection.length === rows.length;
    const handleToggleSelectAll = () => {
        setSelection(allSelected ? [] : rows.map(r => r.paymentId));
    };

    const COLS = isUnsettledMode ? 8 : 7;

    // 선택건 자동 계산(30%)
    const handleAutoCalcSelected = () => {
        if (!isUnsettledMode) return;
        const next = { ...feeEdit };
        for (const id of selection) {
            const row = rows.find(r => r.paymentId === id);
            if (!row) continue;
            next[id] = calc30(row.payAmount);
        }
        setFeeEdit(next);
        setToast({ open: true, severity: "info", msg: `${selection.length}건에 ${FEE_PERCANT}% 수수료 적용` });
    };

    // 정산 마감.
    const handleSettleSelected = async () => {
        setConfirmOpen(false);

        // 안내 문구 & 화면 잠금
        setBlocking(true);

        try {
            await settlementApi.settlePayments({
                ids: selection,
                merchantFeeOverrideById: feeEdit,
                driverFeeOverrideById: {},
            });

            setToast({ open: true, severity: "success", msg: `${selection.length}건 정산 마감 완료` });
            setSelection([]);
            setFeeEdit({});

            await fetchRows();
        } catch (err) {
            console.error(err);
            setToast({
                open: true,
                severity: "error",
                msg: err?.response?.data || "정산 처리 중 오류가 발생했습니다.",
            });
        } finally {
            setBlocking(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
                <Grid container
                    direction={isSmaller900 ? "column" : "row"}
                    justifyContent={isSmaller900 ? "center" : "space-between"}
                    alignItems={isSmaller900 ? "flex-start" :"center"}
                >
                    <QuickRangeChips
                        value={range}
                        onChange={(next) => {
                            setRange(next);
                            setCustom({ from: null, to: null });
                            setPage(1);
                        }}
                    />
                    <Stack
                        direction={isSmaller900 ? "column" : "row"}
                        spacing={1}
                        width={isSmaller900 ? "100%" : "60%"}
                        justifyContent={isSmaller900 ? "center" : "flex-end"}
                        mt={isSmaller900 ? 2 : 0}
                    >
                        <DatePicker
                            label="시작일"
                            value={custom.from}
                            onChange={(v) => {
                                const safe = v && v.isAfter(dayjs()) ? dayjs() : v;
                                setCustom((s) => {
                                    const next = { ...s, from: safe };
                                    setRange((r) => ({ ...r, key: "custom" }));
                                    if (next.to && safe && next.to.isBefore(safe)) next.to = safe;
                                    return next;
                                });
                                setPage(1);
                            }}
                            disableFuture
                            slotProps={{ textField: { size: "small" } }}
                        />
                        <DatePicker
                            label="종료일"
                            value={custom.to}
                            onChange={(v) => {
                                let safe = v && v.isAfter(dayjs()) ? dayjs() : v;
                                setCustom((s) => {
                                    const next = { ...s, to: safe };
                                    setRange((r) => ({ ...r, key: "custom" }));
                                    if (s.from && safe && safe.isBefore(s.from)) next.to = s.from;
                                    return next;
                                });
                                setPage(1);
                            }}
                            disableFuture
                            minDate={custom.from || undefined}
                            slotProps={{ textField: { size: "small" } }}
                        />
                    </Stack>
                </Grid>

                {/* Table */}
                <Paper
                    elevation={1}
                    sx={{
                        borderRadius: 3,
                        bgcolor: t.palette.mode === 'dark' ? t.palette.background.default : t.palette.grey[50],
                        border: 1,
                        borderColor: t.palette.mode === 'dark' ? 'grey.900' : 'grey.300',
                    }} >
                    <Box sx={{ p: 1.5 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} justifyContent="space-between">
                            <Stack direction="row" spacing={1}>
                                {isUnsettledMode && (<>
                                    <Button
                                        variant="outlined"
                                        startIcon={<LibraryAddCheckOutlined />}
                                        onClick={handleToggleSelectAll}
                                        disabled={blocking || loading || rows.length === 0}
                                    >
                                        {allSelected ? "전체 해제" : "전체 선택"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Calculate />}
                                        onClick={handleAutoCalcSelected}
                                        disabled={blocking || selection.length === 0}
                                    >
                                        선택 수수료 계산({FEE_PERCANT}%)
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<DoneOutlined />}
                                        onClick={() => {
                                            const missing = selection.filter((id) => {
                                                const row = rows.find(r => r.paymentId === id);
                                                const fee = feeEdit[id] ?? row?.settlementFee;
                                                return fee === null || fee === undefined;
                                            });
                                            if (missing.length > 0) {
                                                setToast({ open: true, severity: "warning", msg: `수수료 미입력 ${missing.length}건이 있어요. 각 행에 수수료를 입력하거나 '선택 수수료 계산(${FEE_PERCANT}%)'을 눌러 주세요.` });
                                                return;
                                            }
                                            setConfirmOpen(true);
                                        }}
                                        disabled={blocking || selection.length === 0}
                                    >
                                        선택 정산 마감
                                    </Button>
                                </>)}
                            </Stack>

                            <Stack direction="row" spacing={1}>
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>결제수단</InputLabel>
                                    <Select
                                        value={method}
                                        label="결제수단"
                                        disabled={blocking}
                                        onChange={(e) => setMethod(e.target.value)
                                        }>
                                        <MenuItem value="all">전체</MenuItem>
                                        <MenuItem value="kakaopay">카카오페이</MenuItem>
                                        <MenuItem value="tosspay">토스페이</MenuItem>
                                        <MenuItem value="danal">신용카드</MenuItem>
                                        <MenuItem value="phone">휴대폰 결제</MenuItem>
                                        <MenuItem value="unknown">기타</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>정산 상태</InputLabel>
                                    <Select
                                        value={settle}
                                        disabled={blocking}
                                        label="정산 상태"
                                        onChange={(e) => setSettle(e.target.value)
                                        }>
                                        <MenuItem value="unsettled">미정산만</MenuItem>
                                        <MenuItem value="settled">정산완료만</MenuItem>
                                    </Select>
                                </FormControl>

                            </Stack>
                        </Stack>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 1.5, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {(isUnsettledMode
                                        ? [ // 미정산 모드: 선택 포함
                                            "선택",
                                            "결제 ID",
                                            "결제일",
                                            "결제 수단",
                                            "결제 상태",
                                            "결제 금액",
                                            "정산 수수료",
                                            "자세히",
                                        ]
                                        : [ // 정산완료 모드: 선택 제외
                                            "결제 ID",
                                            "결제일",
                                            "결제 수단",
                                            "결제 상태",
                                            "결제 금액",
                                            "정산 수수료",
                                            "자세히",
                                        ]
                                    ).map((h) => (
                                        <th
                                            key={h}
                                            style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #eee" }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                {h}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={COLS} style={{ padding: 16 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 3, mb: 1 }}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2">정산내역 불러오는 중…</Typography>
                                            </Stack>
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLS} style={{ padding: 16 }}>
                                            <Typography variant="body2" textAlign={"center"} sx={{ mt: 3, mb: 1 }}>
                                                표시할 내역이 없습니다.
                                            </Typography>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r) => (
                                        <tr key={r.paymentId}>
                                            {/* ✅ 미정산 모드일 때만 선택 체크박스 노출 */}
                                            {isUnsettledMode && (
                                                <td style={{ padding: 8, textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selection.includes(r.paymentId)}
                                                        disabled={blocking}
                                                        onChange={(e) =>
                                                            setSelection((sel) =>
                                                                e.target.checked
                                                                    ? [...sel, r.paymentId]
                                                                    : sel.filter((id) => id !== r.paymentId)
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}

                                            <td style={{ padding: 8, textAlign: "center" }}>{r.paymentId}</td>
                                            <td style={{ padding: 8, textAlign: "center" }}>{dayjs(r.paid).format("YYYY/MM/DD HH:mm")}</td>
                                            <td style={{ padding: 8, textAlign: "center" }}>
                                                <PaymentMethodChip method={r.payMethod} />
                                            </td>
                                            <td style={{ padding: 8, textAlign: "center" }}>
                                                <PaymentStatusChip status={r.payStatus} />
                                            </td>
                                            <td style={{ padding: 8, textAlign: "center" }}>{currency(r.payAmount)}원</td>

                                            {/* 수수료 셀: 미정산이면 입력/버튼, 정산완료면 값만 */}
                                            <td style={{ padding: 8, textAlign: "center" }}>
                                                {isUnsettledMode ? (
                                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={feeEdit[r.paymentId] ?? r.settlementFee ?? 0}
                                                            disabled={blocking}
                                                            onChange={(e) =>
                                                                setFeeEdit((m) => ({ ...m, [r.paymentId]: Number(e.target.value) }))
                                                            }
                                                            sx={{ width: 120 }}
                                                        />
                                                        <Stack direction="row" spacing={0.5}>
                                                            <Tooltip title="수수료 자동 계산(30%)">
                                                                <IconButton size="small"
                                                                    onClick={() =>
                                                                        setFeeEdit((m) => ({ ...m, [r.paymentId]: Math.round((Number(r.payAmount) || 0) * 0.3) }))
                                                                    }>
                                                                    <CalculateIcon fontSize="inherit" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="수수료 0으로 초기화">
                                                                <IconButton size="small"
                                                                    onClick={() =>
                                                                        setFeeEdit((m) => ({ ...m, [r.paymentId]: 0 }))
                                                                    }>
                                                                    <RestartAltIcon fontSize="inherit" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </Stack>
                                                ) : (
                                                    <>{currency(r.settlementFee ?? 0)}원</>
                                                )}
                                            </td>

                                            <td style={{ padding: 8, textAlign: "center" }}>
                                                <Button size="small" variant="outlined" onClick={() => setDetail(r)}>
                                                    상세
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Box>
                    <Box sx={{ p: 1.5, display: "flex", justifyContent: "center" }}>
                        {/* 페이지네이션 */}
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            color="primary"
                            showFirstButton
                            showLastButton
                            disabled={blocking || loading || totalPages === 0}
                        />
                    </Box>

                </Paper>

                {/* Detail Drawer */}
                <Drawer anchor="right" open={!!detail} onClose={() => setDetail(null)}>
                    <Box sx={{ width: 360, p: 2 }}>
                        {detail && (() => {
                            const feeForDetail = feeEdit[detail.paymentId] ?? (detail.settlementFee ?? calc30(detail.payAmount));
                            const netIfSettled = detail.payAmount - (detail.settlementFee ?? 0);
                            const netIfUnsettled = detail.payAmount - feeForDetail;
                            const isNegative = (detail.payAmount || 0) < 0;

                            return (
                                <Stack spacing={1}>
                                    <Typography variant="h6">거래 상세</Typography>
                                    <Divider />
                                    <Row label="거래 ID" value={detail.paymentId} />
                                    <Row label="결제일시" value={dayjs(detail.paid).format("YYYY-MM-DD HH:mm:ss")} />
                                    <Row label="결제수단" value={METHOD_LABEL[detail.payMethod] || "기타"} />
                                    <Row label="상태" value={STATUS_LABEL[detail.payStatus] || detail.payStatus} />
                                    <Row label="결제금액" value={`${currency(detail.payAmount)}원`} />
                                    {detail.settlement && (
                                        <>
                                            <Row label="정산 수수료" value={`${currency(detail.settlementFee || 0)}원`} />
                                            <Row label="정산액" value={<b>{currency(netIfSettled)}원</b>} />
                                        </>
                                    )}
                                    <Row label="PG 승인번호" value={detail.impUid || "-"} />
                                    <Row label="정산 상태" value={detail.settlement ? "정산 완료" : "정산 대기"} />
                                    {isNegative && (
                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                            * 이 건은 음수 금액(환불/차감)이 포함되어 있어 합산 시 감액 처리됩니다.
                                        </Typography>
                                    )}
                                </Stack>
                            );
                        })()}
                    </Box>
                </Drawer>

                {/* Confirm Dialog */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>선택 정산 마감</DialogTitle>
                    <DialogContent>
                        <Typography>총 {selection.length}건을 정산 마감합니다. 진행하시겠습니까?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>취소</Button>
                        <Button variant="contained" startIcon={<DoneAll />} onClick={handleSettleSelected}>
                            마감
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={toast.open}
                    autoHideDuration={2200}
                    onClose={() => setToast({ open: false, msg: "" })}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert severity={toast.severity || "success"} variant="filled" sx={{ width: "100%" }}>
                        {toast.msg}
                    </Alert>
                </Snackbar>
            </Stack>
            <LoadingComponent open={blocking} text={"불러오는 중…"} />
        </LocalizationProvider>
    );
}

const Row = ({ label, value }) => (
    <Stack direction="row" spacing={1}>
        <Typography variant="body2" color="text.secondary" sx={{ width: 140 }}>
            {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
    </Stack>
);