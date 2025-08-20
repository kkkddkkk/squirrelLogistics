import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotices, deleteNotice } from "./noticeApi";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Paper, TextField, Pagination, Chip, IconButton, Tooltip,
  CircularProgress, Alert, InputAdornment
} from "@mui/material";
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Clear as ClearIcon,
  Notifications as NoticeIcon,
  PushPin as PinIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from "@mui/icons-material";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

export default function NoticeList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async (searchKeyword = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotices(searchKeyword);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("공지 목록을 불러오지 못했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!search.trim()) {
      await load();
      return;
    }
    
    setSearching(true);
    try {
      await load(search.trim());
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setSearch("");
    setPage(1);
    await load();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (!e.target.value.trim()) {
      setPage(1);
      load();
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const paginated = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?\n삭제된 공지사항은 복구할 수 없습니다.")) return;
    
    try {
      await deleteNotice(id);
      await load(search.trim()); // 현재 검색 상태 유지
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e.message;
      if (status === 404) {
        await load(search.trim()); // 이미 없어진 경우: 목록만 동기화
      } else {
        alert(`삭제 실패 (${status}): ${msg}`);
      }
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F7FA',
        py: 4 
      }}
    >
      <Box maxWidth="1200px" mx="auto" px={3}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
            <NoticeIcon sx={{ color: '#113F67', fontSize: 48 }} />
            <Typography variant="h2" sx={{ color: '#113F67', fontWeight: 700, fontSize: '2.5rem' }}>
              공지사항 관리
            </Typography>
          </Stack>
          <Typography variant="body1" color="#909095" sx={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
            시스템 공지사항을 등록, 수정, 삭제할 수 있습니다.
          </Typography>
        </Box>



        {/* 에러 알림 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#FFEBEE',
              border: '1px solid #F44336',
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#D32F2F' }
            }} 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* 검색 및 새 공지 등록 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box sx={{ position: 'relative', flex: 1, mr: 3 }}>
            <TextField
              size="medium"
              placeholder="제목 또는 내용으로 검색"
              value={search}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  fontSize: '1rem',
                  '& fieldset': { borderColor: '#E0E6ED' },
                  '&:hover fieldset': { borderColor: '#58A0C8' },
                  '&.Mui-focused fieldset': { borderColor: '#113F67' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#58A0C8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E0E6ED' },
                  '&:hover fieldset': { borderColor: '#58A0C8' },
                  '&.Mui-focused fieldset': { borderColor: '#113F67' }
                }
              }}
            />
            {search && (
              <Button 
                size="small" 
                onClick={handleSearch}
                disabled={searching}
                sx={{ 
                  mt: 1, 
                  mr: 1,
                  backgroundColor: '#58A0C8',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#34699A' },
                  borderRadius: 2
                }}
                variant="contained"
              >
                {searching ? "검색 중..." : "검색"}
              </Button>
            )}
          </Box>
          <Button 
            variant="contained" 
            onClick={() => navigate("new")}
            startIcon={<AddIcon />}
            sx={{ 
              backgroundColor: '#113F67',
              '&:hover': { backgroundColor: '#0d2d4f' },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(17, 63, 103, 0.3)'
            }}
          >
            새 공지 등록
          </Button>
      </Stack>

        {/* 공지사항 테이블 */}
        <Paper sx={{ 
          boxShadow: '0 4px 20px rgba(17, 63, 103, 0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#113F67' }}>
                <TableRow>
                  <TableCell sx={{ 
                    color: '#FFFFFF', 
                    width: 120, 
                    textAlign: 'center', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <PinIcon sx={{ fontSize: 20 }} />
                      <span>고정</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  }}>
                    제목 및 내용
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#FFFFFF', 
                    width: 180, 
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <CalendarIcon sx={{ fontSize: 20 }} />
                      <span>작성일시</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#FFFFFF', 
                    width: 160, 
                    textAlign: 'center', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  }}>
                    관리
                  </TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: '#113F67' }} />
                      <Typography variant="body1" sx={{ mt: 2, color: '#909095' }}>
                        공지사항을 불러오는 중...
                      </Typography>
                    </TableCell>
                  </TableRow>
              ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <NoticeIcon sx={{ fontSize: 48, color: '#E0E6ED', mb: 2 }} />
                      <Typography variant="h6" color="#909095" sx={{ mb: 1 }}>
                        {search ? `"${search}" 검색 결과가 없습니다.` : "등록된 공지사항이 없습니다."}
                      </Typography>
                      <Typography variant="body2" color="#909095">
                        {search ? "다른 검색어를 시도해보세요." : "새로운 공지사항을 등록해보세요."}
                      </Typography>
                    </TableCell>
                  </TableRow>
              ) : paginated.map((n) => (
                  <TableRow key={n.id} hover sx={{ 
                    '&:hover': { backgroundColor: '#F8F9FA' },
                    backgroundColor: n.pinned ? '#F0F8FF' : 'inherit'
                  }}>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {n.pinned ? (
                        <Chip 
                          icon={<PinIcon />}
                          label="고정" 
                          color="primary" 
                          variant="filled"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: '#113F67',
                            '& .MuiChip-icon': { color: '#FFFFFF' }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="#909095">-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#2A2A2A', 
                            fontWeight: n.pinned ? 700 : 600,
                            mb: 1.5,
                            fontSize: '1.1rem'
                          }}
                        >
                          {n.title}
                        </Typography>
                        {n.content && n.content.length > 120 && (
                          <Typography 
                            variant="body2" 
                            color="#909095" 
                            sx={{ 
                              lineHeight: 1.6,
                              backgroundColor: '#F8F9FA',
                              p: 2,
                              borderRadius: 1.5,
                              border: '1px solid #E0E6ED',
                              fontSize: '0.95rem'
                            }}
                          >
                            {n.content.substring(0, 120)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1} alignItems="flex-start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon sx={{ color: '#58A0C8', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#2A2A2A', fontWeight: 500, fontSize: '1rem' }}>
                            {n.createdAt ? dayjs(n.createdAt).format("YYYY.MM.DD HH:mm") : "-"}
                          </Typography>
                        </Stack>
                        {n.updatedAt && n.createdAt && !dayjs(n.createdAt).isSame(dayjs(n.updatedAt)) && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EditIcon sx={{ color: '#E8A93F', fontSize: 16 }} />
                            <Typography variant="caption" color="#E8A93F" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                              수정: {dayjs(n.updatedAt).format("MM.DD HH:mm")}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="수정" arrow>
                          <IconButton 
                            size="medium" 
                            onClick={() => navigate(`${n.id}`)}
                            sx={{ 
                              color: '#58A0C8',
                              backgroundColor: '#E3F2FD',
                              '&:hover': { 
                                backgroundColor: '#BBDEFB',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제" arrow>
                          <IconButton 
                            size="medium" 
                            onClick={() => handleDelete(n.id)}
                            sx={{ 
                              color: '#FFFFFF',
                              backgroundColor: '#F44336',
                              '&:hover': { 
                                backgroundColor: '#D32F2F',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

          {/* 페이지네이션 */}
          {rows.length > ITEMS_PER_PAGE && (
            <Box sx={{ 
              p: 4, 
              backgroundColor: '#F8F9FA',
              borderTop: '1px solid #E0E6ED'
            }}>
              <Stack alignItems="center" spacing={3}>
                <Pagination
                  count={Math.ceil(rows.length / ITEMS_PER_PAGE)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#909095',
                      fontSize: '1rem',
                      '&.Mui-selected': {
                        backgroundColor: '#113F67',
                        color: '#FFFFFF',
                        fontWeight: 600
                      },
                      '&:hover': {
                        backgroundColor: '#E3F2FD'
                      }
                    }
                  }}
                />
                <Typography variant="body1" color="#909095" sx={{ 
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: 500
                }}>
                  총 <strong>{rows.length}</strong>개 중 {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, rows.length)}개
                  {search && (
                    <span style={{ color: '#113F67', fontWeight: 600 }}>
                      {" "}(검색어: "{search}")
                    </span>
                  )}
                </Typography>
              </Stack>
            </Box>
          )}
      </Paper>
      </Box>
    </Box>
  );
}
