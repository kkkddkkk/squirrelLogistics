
import React, { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Box, useTheme } from "@mui/material";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const thisTheme = useTheme();

  const handleReset = async () => {
    try {
      await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setSent(true);
    } catch {
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          비밀번호 재설정
        </Typography>
        <TextField
          label="가입한 Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{
            background: thisTheme.palette.background.paper,
            "& .MuiInputBase-input": {
              color: thisTheme.palette.text.primary,
              "&:-webkit-autofill": {
                WebkitBoxShadow: `0 0 0 1000px ${thisTheme.palette.background.paper} inset !important`,
                WebkitTextFillColor: thisTheme.palette.text.primary,
              },
            }
          }}
            />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleReset}>
              재설정 메일 발송
            </Button>
        {sent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                이메일로 재설정 링크가 발송되었습니다.
              </Typography>
            </Box>
          )}
      </Paper>
    </Container>
  );
}
