import React, { useEffect, useState } from "react";
import { getNotices, deleteNotice } from "./noticeApi";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Stack, Paper, TextField, IconButton, Pagination
} from "@mui/material";

const ITEMS_PER_PAGE = 10;

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getNotices().then(setNotices);
  }, []);

  const handleDelete = async (id) => {
    await deleteNotice(id);
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notices.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>📢 공지사항 관리</Typography>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="제목 검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Button variant="contained" onClick={() => navigate("new")}>+ 새 공지</Button>
      </Stack>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#113F67" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>제목</TableCell>
                <TableCell sx={{ color: "#fff" }}>작성일</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((notice) => (
                <TableRow key={notice.id} hover>
                  <TableCell>{notice.title}</TableCell>
                  <TableCell>{notice.createdAt}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => navigate(`${notice.id}`)}>수정</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(notice.id)}>삭제</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">결과가 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack alignItems="center" m={2}>
          <Pagination count={Math.ceil(filtered.length / ITEMS_PER_PAGE)} page={page} onChange={(_, v) => setPage(v)} />
        </Stack>
      </Paper>
    </Box>
  );
};

export default NoticeList;
