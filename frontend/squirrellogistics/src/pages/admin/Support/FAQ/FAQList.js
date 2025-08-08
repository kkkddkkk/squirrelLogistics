import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
// import { getFaqs, deleteFaq } from "./faqApi";

const FAQList = () => {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // mock 데이터
  useEffect(() => {
    setFaqs([
      { id: 1, question: "배송은 얼마나 걸리나요?", answer: "2~3일 정도 소요됩니다." },
      { id: 2, question: "반품 정책은 어떻게 되나요?", answer: "7일 이내 환불 가능합니다." },
    ]);
  }, []);

  const handleDelete = (id) => {
    // deleteFaq(id);
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        고객지원
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            FAQ 목록
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("new")}
            sx={{ backgroundColor: "#113F67" }}
          >
            FAQ 등록
          </Button>
        </Stack>

        <TextField
          fullWidth
          placeholder="질문 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <Paper key={faq.id} sx={{ p: 2, mb: 1, display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Q. {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A. {faq.answer}
                </Typography>
              </Box>
              <Tooltip title="삭제">
                <IconButton color="error" onClick={() => handleDelete(faq.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          ))
        ) : (
          <Typography color="text.secondary">검색 결과가 없습니다.</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default FAQList;
