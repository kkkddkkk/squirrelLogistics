import React, { useCallback, useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, Stack, Button, Chip, Divider, Checkbox,
  TextField, MenuItem, Typography, Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchVehicles, deleteVehicle, updateVehicle } from "../../../../api/vehicles";
import VehicleDetailDialog from "./components/VehicleDetailDialog"; // ✅ default import

const C = { blue: "#113F67" };
const colorByStatus = (s) => (s === "운행 가능" ? "success" : "warning");
const fmt = (n) => (n || n === 0 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");

export default function VehicleList({ query }) {
  const navigate = useNavigate();

  // 데이터 & 페이지네이션
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 상세 & 선택 상태
  const [detailRow, setDetailRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const isSelected = (id) => selectedIds.includes(id);

  // 일괄 상태변경용
  const [bulkStatus, setBulkStatus] = useState("운행 가능");

  const load = useCallback(async () => {
    const data = await fetchVehicles({
      page: page + 1,
      size: rowsPerPage,
      keyword: query?.keyword || "",
      status: query?.status || "",
    });
    setRows(data.items || []);
    setTotal(data.total || 0);
    // 페이지/필터 전환 시 선택 유지하려면 아래 줄을 주석 처리
    // setSelectedIds([]);
  }, [page, rowsPerPage, query?.keyword, query?.status]);

  useEffect(() => { load(); }, [load]);

  // 단건 삭제
  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await deleteVehicle(id);
    await load();
  };

  // 체크박스
  const allChecked = rows.length > 0 && selectedIds.length === rows.length;
  const indeterminate = selectedIds.length > 0 && !allChecked;

  const handleSelectAll = (e) => {
    e.stopPropagation();
    setSelectedIds(e.target.checked ? rows.map(r => r.id) : []);
  };
  const handleSelectOne = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // 일괄 상태변경
  const handleApplyBulkStatus = async () => {
    if (selectedIds.length === 0) { alert("선택된 항목이 없습니다."); return; }
    if (!window.confirm(`선택된 ${selectedIds.length}건의 상태를 '${bulkStatus}'(으)로 변경할까요?`)) return;
    await Promise.all(selectedIds.map((id) => updateVehicle(id, { status: bulkStatus })));
    await load();
    alert("일괄 상태변경이 완료되었습니다.");
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) { alert("선택된 항목이 없습니다."); return; }
    if (!window.confirm(`선택된 ${selectedIds.length}건을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await Promise.all(selectedIds.map((id) => deleteVehicle(id)));
    setSelectedIds([]);
    await load();
    alert("선택 항목이 삭제되었습니다.");
  };

  // 상세 보기 (체크박스 유지)
  const handleRowClick = (_e, row) => setDetailRow(row);

  return (
    <Paper>
      {/* 일괄 작업 툴바 */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
          <Typography variant="body2">선택: <b>{selectedIds.length}</b>건</Typography>

          <TextField
            select size="small" label="상태" sx={{ width: 180 }}
            value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
          >
            <MenuItem value="운행 가능">운행 가능</MenuItem>
            <MenuItem value="정비중">정비중</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" sx={{ bgcolor: C.blue }} onClick={handleApplyBulkStatus} disabled={selectedIds.length === 0}>
              선택 상태 일괄변경
            </Button>
            <Button variant="outlined" color="error" onClick={handleBulkDelete} disabled={selectedIds.length === 0}>
              선택 삭제
            </Button>
            <Button variant="text" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>
              선택 해제
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={handleSelectAll} />
            </TableCell>
            <TableCell>차량번호</TableCell>
            <TableCell>기사명</TableCell>
            <TableCell>차종</TableCell>
            <TableCell align="right">최대 적재량(kg)</TableCell>
            <TableCell>상태</TableCell>
            <TableCell align="right">주행거리(km)</TableCell>
            <TableCell>마지막 점검일</TableCell>
            <TableCell>다음 정비 예정일</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map(row => (
            <TableRow
              key={row.id}
              hover
              selected={isSelected(row.id)}
              sx={{ cursor: "pointer" }}
              onClick={(e) => handleRowClick(e, row)}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={isSelected(row.id)} onChange={(e) => handleSelectOne(e, row.id)} />
              </TableCell>

              <TableCell>{row.vehicleNumber}</TableCell>
              <TableCell>{row.driverName}</TableCell>
              <TableCell>{row.vehicleType}</TableCell>
              <TableCell align="right">{fmt(row.loadCapacityKg)}</TableCell>
              <TableCell><Chip label={row.status} color={colorByStatus(row.status)} size="small" /></TableCell>
              <TableCell align="right">{fmt(row.currentDistanceKm)}</TableCell>
              <TableCell>{row.lastInspectionDate}</TableCell>
              <TableCell>{row.nextInspectionDate}</TableCell>

              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={() => navigate(String(row.id))}>수정</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => onDelete(row.id)}>삭제</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} align="center">데이터가 없습니다.</TableCell>
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
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      {/* 상세 다이얼로그 (체크박스 유지) */}
      <VehicleDetailDialog open={!!detailRow} row={detailRow} onClose={() => setDetailRow(null)} />
    </Paper>
  );
}
