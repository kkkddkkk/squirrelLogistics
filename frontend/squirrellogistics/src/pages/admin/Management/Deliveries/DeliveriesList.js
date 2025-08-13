// src/pages/admin/Management/Deliveries/DeliveriesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Divider,
  Stack,
  Button,
  Chip,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fetchDeliveries, deleteDelivery } from "../../../../api/deliveries";

// 상태 칩 색상
const colorByStatus = (s) => {
  switch (s) {
    case "PENDING":
      return "default";
    case "ASSIGNED":
      return "info";
    case "PICKED_UP":
      return "secondary";
    case "IN_TRANSIT":
      return "primary";
    case "DELIVERED":
      return "success";
    case "CANCELED":
      return "warning";
    default:
      return "default";
  }
};

// 상태 옵션
const STATUSES = [
  { label: "전체", value: "" },
  { label: "대기", value: "PENDING" },
  { label: "배차완료", value: "ASSIGNED" },
  { label: "픽업", value: "PICKED_UP" },
  { label: "이동중", value: "IN_TRANSIT" },
  { label: "배송완료", value: "DELIVERED" },
  { label: "취소", value: "CANCELED" },
];

export default function DeliveriesList() {
  const navigate = useNavigate();

  // 필터 상태
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(dayjs().add(-7, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  // 테이블/페이지네이션 상태
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // zero-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const params = useMemo(
    () => ({
      page: page + 1,
      size: rowsPerPage,
      keyword,
      status,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
      endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
    }),
    [page, rowsPerPage, keyword, status, startDate, endDate]
  );

  const load = async () => {
    try {
      const data = await fetchDeliveries(params);
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch {
      // === 백엔드 미연동 시 목업 + 필터 적용 ===
      const all = Array.from({ length: 42 }).map((_, i) => ({
        id: i + 1,
        orderNo: `ORD-${String(10000 + i)}`,
        recipient: `수취인${i + 1}`,
        origin: "서울 강남구",
        destination: "부산 해운대구",
        driver: i % 2 ? "김기사" : "박기사",
        vehicle: i % 2 ? "1톤 트럭" : "윙바디",
        status: ["PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED"][i % 4],
        eta: dayjs().add(i % 5, "hour").format("YYYY-MM-DD HH:mm"),
        scheduledAt: dayjs().add(-(i % 12), "day").format("YYYY-MM-DD"),
      }));

      const filtered = all.filter((r) => {
        const passKw = keyword
          ? r.orderNo.toLowerCase().includes(keyword.toLowerCase()) ||
            r.recipient.toLowerCase().includes(keyword.toLowerCase())
          : true;
        const passSt = status ? r.status === status : true;
        const passStart = startDate ? dayjs(r.scheduledAt).isAfter(startDate.subtract(1, "day")) : true;
        const passEnd = endDate ? dayjs(r.scheduledAt).isBefore(endDate.add(1, "day")) : true;
        return passKw && passSt && passStart && passEnd;
      });

      setTotal(filtered.length);
      setRows(filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDelivery(id);
      await load();
    } catch {
      // mock UX
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");
    setStartDate(dayjs().add(-7, "day"));
    setEndDate(dayjs());
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700, mb: 2 }}>
        배송 관리
      </Typography>

      {/* 얇은 검색/필터 바 */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#F5F7FA" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField
              label="검색어(주문번호/수취인)"
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
              {STATUSES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" sx={{ bgcolor: "#113F67" }} onClick={() => { setPage(0); load(); }}>
                검색
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                초기화
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>

      {/* 리스트 */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>주문번호</TableCell>
              <TableCell>수취인</TableCell>
              <TableCell>출발지 → 도착지</TableCell>
              <TableCell>드라이버</TableCell>
              <TableCell>차량</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>ETA</TableCell>
              <TableCell ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ color: "#113F67", fontWeight: 600 }}>{row.orderNo}</TableCell>
                <TableCell>{row.recipient}</TableCell>
                <TableCell>
                  {row.origin} → {row.destination}
                </TableCell>
                <TableCell>{row.driver}</TableCell>
                <TableCell>{row.vehicle}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={colorByStatus(row.status)} size="small" />
                </TableCell>
                <TableCell>{row.eta}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/admin/management/deliveries/${row.id}`)}
                    >
                      수정
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                      삭제
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
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
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Box>
  );
}
