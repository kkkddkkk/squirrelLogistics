import React, { useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserList from "./UserList"; // ✅ 단수명

const ROLES = [
  { label: "전체", value: "" },
  { label: "관리자", value: "ADMIN" },
  { label: "매니저", value: "MANAGER" },
  { label: "일반",   value: "USER" },
  { label: "기사",   value: "DRIVER" }, // ✅ 추가
];

export default function UserManagementList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [submitToken, setSubmitToken] = useState(0); // ✅ 검색 트리거

  const query = useMemo(() => ({ keyword, role, submitToken }), [keyword, role, submitToken]);

  return (
    <Box>
      <Typography variant="h5" sx={{ color: "#113F67", fontWeight: 700, mb: 2 }}>
        사용자 관리 <Typography component="span" sx={{ ml: 1, fontSize: 12, color: "#999" }}>v2</Typography>
      </Typography>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#F5F7FA" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="검색어(이름/이메일/아이디/회사)"
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="권한"
            size="small"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ width: 180 }}
          >
            {ROLES.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#113F67" }}
              onClick={() => setSubmitToken(t => t + 1)} // ✅ 검색 실행
            >
              검색
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#E8A93F" }}
              onClick={() => navigate("new")}
            >
              신규 등록
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <UserList query={query} />
    </Box>
  );
}
