import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
} from "@mui/material";
// import { getPolicy, updatePolicy } from "./policyApi";

const PolicyPage = () => {
  const [policy, setPolicy] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedContent, setUpdatedContent] = useState("");

  useEffect(() => {
    // getPolicy().then(setPolicy);
    // 더미 데이터
    const dummy = "제1조 (목적)\n본 약관은 물류중개서비스의 이용과 관련하여... 등등";
    setPolicy(dummy);
    setUpdatedContent(dummy);
  }, []);

  const handleSave = async () => {
    // await updatePolicy(updatedContent);
    setPolicy(updatedContent);
    setEditMode(false);
    alert("정책이 저장되었습니다.");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        정책 관리
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        {editMode ? (
          <>
            <TextField
              fullWidth
              multiline
              minRows={12}
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="contained" color="primary" onClick={handleSave}>
                저장
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setEditMode(false);
                  setUpdatedContent(policy);
                }}
              >
                취소
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {policy}
            </Typography>
            <Stack direction="row" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
              >
                수정하기
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PolicyPage;
