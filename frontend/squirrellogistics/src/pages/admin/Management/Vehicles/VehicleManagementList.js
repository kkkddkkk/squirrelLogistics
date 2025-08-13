import React, { useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VehicleList from "./VehicleList";

const C = { blue: "#113F67", gold: "#E8A93F", grayBg: "#F5F7FA" };
const STATUS = ["전체", "운행 가능", "정비중"];

export default function VehicleManagementList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(""); // 차량번호/기사명
  const [status, setStatus] = useState("");

  const query = useMemo(() => ({ keyword, status }), [keyword, status]);

  return (
    <Box>
      <Typography variant="h5" sx={{ color: C.blue, fontWeight: 700, mb: 2 }}>
        차량 관리
      </Typography>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: C.grayBg }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="검색어(차량번호/기사명)"
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
            {STATUS.map((s) => (
              <MenuItem key={s} value={s === "전체" ? "" : s}>{s}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" sx={{ bgcolor: C.blue }}>검색</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: C.gold }}
              onClick={() => navigate("/admin/management/vehicles/new")}
            >
              신규 등록
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <VehicleList query={query} />
    </Box>
  );
}
