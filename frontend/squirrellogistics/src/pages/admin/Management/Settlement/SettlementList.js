// src/pages/admin/Management/Settlement/SettlementList.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Stack, TextField, MenuItem, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, Divider, Checkbox, Toolbar, Tooltip, IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  fetchSettlements,
  deleteSettlement,
  bulkUpdateSettlementStatus,
  exportToCSV
} from "../../../../api/settlements";
import SettlementDetailDialog from "./components/SettlementDetailDialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const STATUSES = [
  { label: "전체", value: "" },
  { label: "대기", value: "PENDING" },
  { label: "승인", value: "APPROVED" },
  { label: "지급완료", value: "PAID" },
  { label: "취소", value: "CANCELED" },
];

export default function SettlementList() {
  const navigate = useNavigate();

  // 검색/필터
  const [keyword, setKeyword] = useState("");
  const [status, setStatus]   = useState("");
  const [startDate, setStartDate] = useState(dayjs().add(-30, "day"));
  const [endDate, setEndDate]     = useState(dayjs());

  // 테이블 상태
  const [rows, setRows] = useState([]);
  const [exportRows, setExportRows] = useState([]); // 현재 필터+정렬 적용된 전체(페이지네이션 전)
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);

  // 선택(일괄처리)
  const [selectedIds, setSelectedIds] = useState([]);

  const params = useMemo(() => ({
    page: page + 1,
    size: rowsPerPage,
    keyword,
    status,
    startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
    endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
  }), [page, rowsPerPage, keyword, status, startDate, endDate]);

  const money = (n) => (n ?? 0).toLocaleString();

  const statusColor = (s) => {
    switch (s) {
      case "PENDING":  return "default";
      case "APPROVED": return "info";
      case "PAID":     return "success";
      case "CANCELED": return "warning";
      default:         return "default";
    }
  };

  const load = async () => {
    try {
      const data = await fetchSettlements(params);
      setRows(data.items || []);
      setTotal(data.total || 0);
      setExportRows(data.items || []); // 서버 페이징일 땐 필터 전체가 아니므로 CSV는 서버가 내려주는 목록 기준
    } catch {
      // ===== Mock =====
      const all = Array.from({ length: 45 }).map((_, i) => ({
        id: i + 1,
        settlementNo: `SET-${10000 + i}`,
        orderNo: `ORD-${20000 + i}`,
        partner: i % 2 ? "A물류" : "B소사이어티",
        amount: (i + 1) * 10000,
        fee: Math.round(((i + 1) * 10000) * 0.05),
        vat: Math.round(((i + 1) * 10000) * 0.1),
        status: STATUSES[(i % (STATUSES.length - 1)) + 1].value,
        settledAt: dayjs().add(-(i % 25), "day").format("YYYY-MM-DD"),
      }));

      const filtered = all.filter(r => {
        const passKw = keyword ? (r.settlementNo.includes(keyword) || r.orderNo.includes(keyword) || r.partner.includes(keyword)) : true;
        const passSt = status ? r.status === status : true;
        const passStart = startDate ? dayjs(r.settledAt).isAfter(startDate.subtract(1, "day")) : true;
        const passEnd   = endDate ? dayjs(r.settledAt).isBefore(endDate.add(1, "day")) : true;
        return passKw && passSt && passStart && passEnd;
      });

      setExportRows(filtered);
      setTotal(filtered.length);
      setRows(filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
    }
    setSelectedIds([]); // 로드 시 선택 초기화
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [params]);

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteSettlement(id);
      await load();
    } catch {
      // mock UX
      setRows(prev => prev.filter(r => r.id !== id));
      setExportRows(prev => prev.filter(r => r.id !== id));
      setTotal(prev => Math.max(prev - 1, 0));
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelectedIds(newSelecteds);
      return;
    }
    setSelectedIds([]);
  };

  const handleClick = (id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1),
      );
    }
    setSelectedIds(newSelected);
  };

  const doBulkUpdate = async (newStatus) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.length}건을 '${newStatus}'로 변경할까요?`)) return;
    try {
      await bulkUpdateSettlementStatus({ ids: selectedIds, status: newStatus });
      await load();
      alert("일괄 상태 변경 완료");
    } catch {
      // mock 업데이트
      const updater = (list) =>
        list.map(r => selectedIds.includes(r.id) ? { ...r, status: newStatus } : r);
      setRows(updater);
      setExportRows(updater);
      setSelectedIds([]);
      alert("일괄 상태 변경 완료(목업)");
    }
  };

  const toolbarActive = selectedIds.length > 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700, mb: 2 }}>
        정산 관리
      </Typography>

      {/* 검색/필터 */}
      <Paper sx={{ p: 2, mb: 1, backgroundColor: "#F5F7FA" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField
              label="검색어(정산번호/주문번호/파트너)"
              size="small"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="상태"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ width: 180 }}
            >
              {STATUSES.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>

            <DatePicker label="시작일" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: "small" } }} />
            <DatePicker label="종료일" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: "small" } }} />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" sx={{ bgcolor: "#113F67" }} onClick={() => { setPage(0); load(); }}>
                검색
              </Button>
              <Button variant="outlined" onClick={() => {
                setKeyword(""); setStatus(""); setStartDate(dayjs().add(-30, "day")); setEndDate(dayjs()); setPage(0);
              }}>
                초기화
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "#E8A93F" }}
                onClick={() => navigate("/admin/management/settlement/new")}
              >
                신규 정산
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => exportToCSV(exportRows, "settlements.csv")}
              >
                CSV 내보내기
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>

      {/* 선택 툴바 */}
      <Toolbar
        sx={{
          px: 2,
          minHeight: 48,
          bgcolor: toolbarActive ? "#F5F7FA" : "transparent",
          border: toolbarActive ? "1px solid #eee" : "none",
          borderRadius: 1,
          mb: toolbarActive ? 1 : 0,
        }}
      >
        <Typography sx={{ flex: 1 }} color="inherit" variant="subtitle1">
          {toolbarActive ? `${selectedIds.length}건 선택됨` : ""}
        </Typography>
        {toolbarActive && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="일괄 승인(APPROVED)">
              <IconButton color="primary" onClick={() => doBulkUpdate("APPROVED")}>
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="일괄 지급완료(PAID)">
              <IconButton color="success" onClick={() => doBulkUpdate("PAID")}>
                <PaymentsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Toolbar>

      {/* 목록 */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
                  checked={rows.length > 0 && selectedIds.length === rows.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>정산번호</TableCell>
              <TableCell>주문번호</TableCell>
              <TableCell>파트너</TableCell>
              <TableCell align="right">금액</TableCell>
              <TableCell align="right">수수료</TableCell>
              <TableCell align="right">부가세</TableCell>
              <TableCell align="right">합계(₩)</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>정산일</TableCell>
              <TableCell ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              const isItemSelected = isSelected(row.id);
              const labelId = `settlement-checkbox-${row.id}`;
              const total = (row.amount ?? 0) - (row.fee ?? 0) + (row.vat ?? 0);
              return (
                <TableRow key={row.id} hover selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleClick(row.id)}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </TableCell>
                  <TableCell
                    id={labelId}
                    sx={{ cursor: "pointer", color: "#113F67", fontWeight: 600 }}
                    onClick={() => setSelected(row)}
                  >
                    {row.settlementNo}
                  </TableCell>
                  <TableCell>{row.orderNo}</TableCell>
                  <TableCell>{row.partner}</TableCell>
                  <TableCell align="right">{money(row.amount)}</TableCell>
                  <TableCell align="right">{money(row.fee)}</TableCell>
                  <TableCell align="right">{money(row.vat)}</TableCell>
                  <TableCell align="right">{money(total)}</TableCell>
                  <TableCell><Chip size="small" label={row.status} color={statusColor(row.status)} /></TableCell>
                  <TableCell>{row.settledAt}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => navigate(`/admin/management/settlement/${row.id}`)}>수정</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => onDelete(row.id)}>삭제</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={11} align="center">데이터가 없습니다.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <SettlementDetailDialog open={!!selected} row={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
