import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
// import { getInquiryById, submitAnswer } from "./inquiryApi";

const InquiryDetail = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState("");

  // 임시 데이터 (백엔드 연결 전)
  useEffect(() => {
    setInquiry({
      id,
      title: "배송 지연 문의",
      userName: "홍길동",
      content: "배송이 3일째 안 오고 있어요. 확인 부탁드립니다.",
      createdAt: "2025-08-01",
      status: "미처리",
      answer: "",
    });
  }, [id]);

  const handleSubmit = () => {
    if (!answer.trim()) return alert("답변을 입력해주세요.");

    // submitAnswer(id, answer).then(() => ...)
    setInquiry((prev) => ({ ...prev, answer, status: "답변 완료" }));
    alert("답변이 등록되었습니다.");
  };

  if (!inquiry) return null;

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        문의 상세보기
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight={600}>
          제목: {inquiry.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          작성자: {inquiry.userName} | 작성일: {inquiry.createdAt}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {inquiry.content}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          관리자 답변
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="답변을 입력해주세요"
        />
        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            답변 등록
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default InquiryDetail;
