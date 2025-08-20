// src/pages/admin/Management/Banners/BannerList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Checkbox,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  fetchBannersWithFallback,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
  bulkUpdateBanners,
} from "../../../../api/banner";

const PALETTE = {
  blue: "#113F67",
  gold: "#E8A93F",
  grayBg: "#F5F7FA",
  text: "#2A2A2A",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
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

const SORT_OPTIONS = [
  { label: "등록순", value: "created" },
  { label: "수정순", value: "updated" },
  { label: "순서순", value: "order" },
  { label: "제목순", value: "title" },
  { label: "시작일순", value: "startDate" },
];

export default function BannerList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBanners, setSelectedBanners] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, count: 0 });
  const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: "", count: 0 });

  // 필터링 및 정렬된 데이터
  const processedRows = useMemo(() => {
    let filtered = rows.filter(banner => {
      const matchesKeyword = !keyword || 
        [banner.title, banner.position, banner.memo, banner.linkUrl]
          .some(field => String(field || "").toLowerCase().includes(keyword.toLowerCase()));
      const matchesStatus = !status || banner.status === status;
      const matchesPosition = !position || banner.position === position;
      return matchesKeyword && matchesStatus && matchesPosition;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "updated":
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "startDate":
          return new Date(a.startDate) - new Date(b.startDate);
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

    return filtered;
  }, [rows, keyword, status, position, sortBy]);

  // 페이지네이션된 데이터
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return processedRows.slice(start, start + rowsPerPage);
  }, [processedRows, page, rowsPerPage]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchBannersWithFallback();
      const list = result.data || result; // API 응답 구조에 따라 조정
    setRows(list);
    setPage(0);
      setSelectedBanners([]);
      setIsSelectAll(false);
    } catch (error) {
      showSnackbar("배너 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = () => {
    setPage(0);
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");
    setPosition("");
    setSortBy("order");
    setPage(0);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBanners(paginatedRows.map(row => row.id));
      setIsSelectAll(true);
    } else {
      setSelectedBanners([]);
      setIsSelectAll(false);
    }
  };

  const handleSelectBanner = (id, checked) => {
    if (checked) {
      setSelectedBanners(prev => [...prev, id]);
    } else {
      setSelectedBanners(prev => prev.filter(bannerId => bannerId !== id));
    }
  };

  const handleDelete = async (id) => {
    try {
    await deleteBanner(id);
      showSnackbar("배너가 삭제되었습니다.");
      load();
    } catch (error) {
      showSnackbar("삭제에 실패했습니다.", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedBanners.map(id => deleteBanner(id)));
      showSnackbar(`${selectedBanners.length}개의 배너가 삭제되었습니다.`);
      setDeleteDialog({ open: false, count: 0 });
    load();
    } catch (error) {
      showSnackbar("일괄 삭제에 실패했습니다.", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
    await toggleBannerStatus(id);
      showSnackbar("상태가 변경되었습니다.");
      load();
    } catch (error) {
      showSnackbar("상태 변경에 실패했습니다.", "error");
    }
  };

  const handleBulkToggle = async (newStatus) => {
    try {
      await bulkUpdateBanners(selectedBanners.map(id => ({ id, status: newStatus })));
      showSnackbar(`${selectedBanners.length}개 배너의 상태가 변경되었습니다.`);
      setBulkActionDialog({ open: false, action: "", count: 0 });
    load();
    } catch (error) {
      showSnackbar("일괄 상태 변경에 실패했습니다.", "error");
    }
  };

  const handleReorder = async () => {
    // 간단한 재정렬: 현재 페이지 순서대로 order 재할당
    const start = page * rowsPerPage;
    const pageSlice = paginatedRows.map((r, idx) => ({ id: r.id, order: start + idx + 1 }));
    
    try {
      await reorderBanners(pageSlice);
      showSnackbar("순서가 저장되었습니다.");
    load();
    } catch (error) {
      showSnackbar("순서 저장에 실패했습니다.", "error");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["제목", "위치", "상태", "시작일", "종료일", "순서", "링크", "메모"],
      ...paginatedRows.map(row => [
        row.title,
        row.position,
        row.status === "ACTIVE" ? "노출" : "비노출",
        row.startDate,
        row.endDate,
        row.order,
        row.linkUrl || "",
        row.memo || ""
      ])
    ].map(row => row.map(field => `"${field}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `배너목록_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: PALETTE.blue, fontWeight: 700, mb: 3 }}>
        배너 관리
      </Typography>

      {/* 검색 및 필터 */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: PALETTE.grayBg }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              size="small"
            >
              필터 {showFilters ? "숨기기" : "보이기"}
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={load}
              variant="outlined"
              size="small"
              disabled={loading}
            >
              새로고침
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => navigate("/admin/management/banners/new")}
              sx={{ backgroundColor: PALETTE.blue }}
            >
              새 배너
            </Button>
          </Stack>

          {showFilters && (
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="검색어"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목/위치/메모/링크"
            size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }}
          />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            label="노출 상태"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
                  fullWidth
          >
            {STATUS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            label="위치"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            size="small"
                  fullWidth
          >
            {POSITIONS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="정렬"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {SORT_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
                    onClick={handleSearch}
              sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
                    fullWidth
            >
              검색
            </Button>
            <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{ borderColor: PALETTE.gold, color: PALETTE.gold }}
                    fullWidth
                  >
                    초기화
            </Button>
          </Stack>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Paper>

      {/* 일괄 작업 도구 */}
      {selectedBanners.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: PALETTE.warning + "10" }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Typography variant="subtitle2" color="warning.main">
              {selectedBanners.length}개 배너 선택됨
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => setBulkActionDialog({ open: true, action: "status", count: selectedBanners.length })}
            >
              상태 변경
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialog({ open: true, count: selectedBanners.length })}
            >
              일괄 삭제
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSelectedBanners([]);
                setIsSelectAll(false);
              }}
            >
              선택 해제
            </Button>
          </Stack>
        </Paper>
      )}

      {/* 배너 목록 */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography sx={{ color: PALETTE.text }}>
            총 <b>{processedRows.length}</b>건
          </Typography>
          <Divider flexItem sx={{ mx: 2 }} />
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            variant="outlined"
            sx={{ borderColor: PALETTE.gold, color: PALETTE.gold }}
          >
            내보내기
          </Button>
            <Button
              size="small"
            startIcon={<SortIcon />}
              onClick={handleReorder}
            variant="outlined"
              sx={{
                ml: "auto",
                border: `1px solid ${PALETTE.gold}`,
                color: PALETTE.gold,
              }}
            >
              순서 저장
            </Button>
        </Stack>

        {isMobile ? (
          // 모바일 카드 뷰
          <Stack spacing={3}>
            {paginatedRows.map((row, index) => (
              <Card key={row.id} variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Checkbox
                      checked={selectedBanners.includes(row.id)}
                      onChange={(e) => handleSelectBanner(row.id, e.target.checked)}
                      size="small"
                    />
                    <DragIcon sx={{ color: "text.secondary", cursor: "grab" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      #{row.order || index + 1}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                    {row.imageUrl ? (
                      <img
                        src={row.imageUrl}
                        alt={row.title}
                        style={{ width: 100, height: 75, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 75,
                          borderRadius: 1,
                          background: PALETTE.grayBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          fontSize: 10,
                        }}
                      >
                        No Image
                      </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        {row.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {row.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {row.startDate} ~ {row.endDate}
                      </Typography>
                      <Chip
                        label={row.status === "ACTIVE" ? "노출" : "비노출"}
                        size="small"
                        sx={{
                          color: row.status === "ACTIVE" ? "#fff" : PALETTE.text,
                          background: row.status === "ACTIVE" ? PALETTE.blue : "rgba(0,0,0,0.08)",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
        </Stack>

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => handleToggle(row.id)}>
                      {row.status === "ACTIVE" ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/management/banners/${row.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          // 데스크톱 테이블 뷰
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: PALETTE.grayBg }}>
                <TableCell padding="checkbox" width={50}>
                  <Checkbox
                    checked={isSelectAll}
                    indeterminate={selectedBanners.length > 0 && selectedBanners.length < paginatedRows.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
              </TableCell>
                <TableCell align="center" width={80}>순서</TableCell>
                <TableCell width={140}>썸네일</TableCell>
              <TableCell>제목</TableCell>
                <TableCell width={100}>위치</TableCell>
                <TableCell width={150}>기간</TableCell>
                <TableCell width={80}>상태</TableCell>
                <TableCell align="right" width={160}>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {paginatedRows.map((row, index) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={selectedBanners.includes(row.id)}
                  sx={{
                    "&:hover": { backgroundColor: PALETTE.grayBg + "50" }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedBanners.includes(row.id)}
                      onChange={(e) => handleSelectBanner(row.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DragIcon sx={{ color: "text.secondary", mr: 1 }} />
                      <Typography variant="body2">
                        {row.order || index + 1}
                      </Typography>
                    </Box>
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
                        background: row.status === "ACTIVE" ? PALETTE.blue : "rgba(0,0,0,0.08)",
                        fontWeight: 700,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={row.status === "ACTIVE" ? "비노출으로 변경" : "노출로 변경"}>
                      <IconButton onClick={() => handleToggle(row.id)}>
                          {row.status === "ACTIVE" ? <VisibilityIcon /> : <VisibilityOffIcon />}
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedRows.length === 0 && (
              <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8, color: "#888" }}>
                    {loading ? "로딩 중..." : "배너가 없습니다. '새 배너'를 등록해 보세요."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}

        <TablePagination
          component="div"
          count={processedRows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          sx={{ mt: 3 }}
        />
      </Paper>

      {/* 일괄 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, count: 0 })}>
        <DialogTitle>일괄 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            선택된 {deleteDialog.count}개의 배너를 정말 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, count: 0 })}>취소</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일괄 상태 변경 다이얼로그 */}
      <Dialog open={bulkActionDialog.open} onClose={() => setBulkActionDialog({ open: false, action: "", count: 0 })}>
        <DialogTitle>일괄 상태 변경</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            선택된 {bulkActionDialog.count}개 배너의 상태를 변경하시겠습니까?
          </Typography>
          <Stack direction="row" spacing={3}>
            <Button
              variant="outlined"
              onClick={() => handleBulkToggle("ACTIVE")}
              sx={{ borderColor: PALETTE.success, color: PALETTE.success }}
            >
              모두 노출
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleBulkToggle("INACTIVE")}
              sx={{ borderColor: PALETTE.warning, color: PALETTE.warning }}
            >
              모두 비노출
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog({ open: false, action: "", count: 0 })}>
            취소
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
