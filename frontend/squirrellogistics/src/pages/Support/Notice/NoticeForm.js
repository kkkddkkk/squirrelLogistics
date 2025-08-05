import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNotice, getNoticeById, updateNotice } from "./noticeApi";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

const NoticeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    if (isEdit) {
      getNoticeById(id).then(setForm);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isEdit) {
      await updateNotice(id, form);
    } else {
      await createNotice(form);
    }
    navigate("/support/notice");
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>{isEdit ? "공지사항 수정" : "새 공지 등록"}</Typography>
      <Stack spacing={2}>
        <TextField name="title" label="제목" value={form.title} onChange={handleChange} fullWidth />
        <TextField name="content" label="내용" value={form.content} onChange={handleChange} fullWidth multiline rows={8} />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => navigate(-1)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit}>저장</Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NoticeForm;
