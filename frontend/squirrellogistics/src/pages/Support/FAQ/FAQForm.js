import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFaqById, updateFaq, createFaq } from "./faqApi";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

const FAQForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ question: "", answer: "" });

  useEffect(() => {
    if (isEdit) {
      getFaqById(id).then(setForm);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    isEdit ? await updateFaq(id, form) : await createFaq(form);
    navigate("/support/faq");
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>{isEdit ? "FAQ 수정" : "FAQ 등록"}</Typography>
      <Stack spacing={2}>
        <TextField name="question" label="질문" value={form.question} onChange={handleChange} fullWidth />
        <TextField name="answer" label="답변" value={form.answer} onChange={handleChange} fullWidth multiline rows={6} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => navigate(-1)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit}>저장</Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default FAQForm;
