
import React, { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Box } from "@mui/material";

export default function FindIdPage() {
  const [phone, setPhone] = useState("");
  const [id, setId] = useState("");

  const handleFindId = async () => {
    try {
      const res = await fetch("/api/auth/find-id?phone=" + phone);
      const data = await res.json();
      setId(data.email || "아이디를 찾을 수 없습니다.");
    } catch {
      setId("오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          아이디 찾기
        </Typography>
        <TextField
          label="가입한 전화번호"
          fullWidth
          margin="normal"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleFindId}>
          아이디 찾기
        </Button>
        {id && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">결과</Typography>
            <Typography variant="body1">{id}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
