// src/pages/admin/Management/Banners/BannerList.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapVert as OrderIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  fetchBanners,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
} from "../../../../api/banner";

const PALETTE = {
  blue: "#113F67",
  gold: "#E8A93F",
  grayBg: "#F5F7FA",
  text: "#2A2A2A",
};

const STATUS = [
  { label: "전체", value: "" },
  { label: "노출", value: "ACTIVE" },
  { label: "비노출", value: "INACTIVE" },
];
const POSITIONS = [
  { label: "전체", value: "" },
  { label: "홈 상단", value: "홈 상단" },
  { label: "홈 중단", value: "홈 중단" },
  { label: "홈 하단", value: "홈 하단" },
];

export default function BannerList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRpp] = useState(10);

  const load = async () => {
    const list = await fetchBanners({ keyword, status, position });
    setRows(list);
    setPage(0);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const filteredCount = useMemo(() => rows.length, [rows]);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await deleteBanner(id);
    load();
  };

  const handleToggle = async (id) => {
    await toggleBannerStatus(id);
    load();
  };

  const handleReorder = async () => {
    // 간단한 재정렬: 현재 페이지 순서대로 order 재할당 (드래그 없음)
    const start = page * rowsPerPage;
    const pageSlice = rows.slice(start, start + rowsPerPage);
    const next = pageSlice.map((r, idx) => ({ id: r.id, order: start + idx + 1 }));
    await reorderBanners(next);
    load();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: PALETTE.blue, fontWeight: 700, mb: 2 }}>
        배너 관리
      </Typography>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: PALETTE.grayBg }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            label="검색어"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목/위치/메모/링크"
            size="small"
            sx={{ width: 260, background: "#fff" }}
          />
          <TextField
            select
            label="노출 상태"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
            sx={{ width: 160, background: "#fff" }}
          >
            {STATUS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="위치"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            size="small"
            sx={{ width: 160, background: "#fff" }}
          >
            {POSITIONS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
            <Button
              variant="outlined"
              onClick={load}
              sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
            >
              검색
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => navigate("/admin/management/banners/new")}
              sx={{ backgroundColor: PALETTE.blue }}
            >
              새 배너
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ color: PALETTE.text }}>
            총 <b>{filteredCount}</b>건
          </Typography>
          <Divider flexItem sx={{ mx: 1 }} />
          <Tooltip title="현재 페이지 순서대로 정렬 반영">
            <Button
              size="small"
              startIcon={<OrderIcon />}
              onClick={handleReorder}
              sx={{
                ml: "auto",
                border: `1px solid ${PALETTE.gold}`,
                color: PALETTE.gold,
              }}
              variant="outlined"
            >
              순서 저장
            </Button>
          </Tooltip>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: PALETTE.grayBg }}>
              <TableCell align="center" width={64}>
                순서
              </TableCell>
              <TableCell>썸네일</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>위치</TableCell>
              <TableCell>기간</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right" width={160}>
                액션
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={row.order ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value || "0", 10);
                        setRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, order: val } : r))
                        );
                      }}
                      sx={{ width: 72 }}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    {row.imageUrl ? (
                      <img
                        src={row.imageUrl}
                        alt={row.title}
                        style={{ width: 120, height: 48, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 120,
                          height: 48,
                          borderRadius: 1,
                          background: PALETTE.grayBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          fontSize: 12,
                        }}
                      >
                        No Image
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>
                    {row.startDate} ~ {row.endDate}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === "ACTIVE" ? "노출" : "비노출"}
                      sx={{
                        color: row.status === "ACTIVE" ? "#fff" : PALETTE.text,
                        background:
                          row.status === "ACTIVE" ? PALETTE.blue : "rgba(0,0,0,0.08)",
                        fontWeight: 700,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="노출 토글">
                      <IconButton onClick={() => handleToggle(row.id)}>
                        <ToggleOnIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="수정">
                      <IconButton
                        onClick={() => navigate(`/admin/management/banners/${row.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#888" }}>
                  배너가 없습니다. “새 배너”를 등록해 보세요.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRpp(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
    </Box>
  );
}
