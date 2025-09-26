import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, Grid, TextField, FormControlLabel, Checkbox, Chip, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "blockquote", "code-block"],
    ["clean"],
  ],
};
const formats = ["header", "bold", "italic", "underline", "strike", "color", "background", "list", "bullet", "align", "link", "blockquote", "code-block"];

export default function NoticeEditor({
  mode = "create",                       // "create" | "edit"
  initial = { title: "", content: "", pinned: false },
  onSubmit, onBack,
  isMobile,
  submitting = false
}) {
  const theme = useTheme();

  const [title, setTitle] = useState(initial.title || "");
  const [contentHtml, setContentHtml] = useState(initial.content || "");
  const [pinned, setPinned] = useState(!!initial.pinned);

  useEffect(() => {
    setTitle(initial.title || "");
    setContentHtml(initial.content || "");
    setPinned(!!initial.pinned);
  }, [initial]);

  const handleSubmit = () => {
    const safeHtml = DOMPurify.sanitize(contentHtml, { USE_PROFILES: { html: true } });
    onSubmit?.({ title, content: safeHtml, pinned });
  };

  return (
    <Grid container justifyContent="center" marginBottom={0} minHeight="100vh">
      <Grid size={isMobile ? 1 : 3} />
      <Grid size={isMobile ? 10 : 6}>
        <Box display="flex" justifyContent="flex-start" mb={2} mt={0}>
          <Chip
            icon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            label="전체 목록 이동"
            variant="outlined"
            color="primary"
            size="small"
            onClick={onBack}
            sx={{ height: 24, fontSize: 12, fontWeight: "bold", px: 0.5 }}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 240 }}
          />

          <Box sx={{
            "& .ql-toolbar.ql-snow": {
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.mode === "dark"
                ? theme.palette.background.default
                : theme.palette.background.paper,
            },
            "& .ql-container.ql-snow": {
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.common.white,
            },
            "& .ql-editor": { color: theme.palette.text.primary },
            "& .ql-editor.ql-blank::before": {
              color: theme.palette.mode === "dark" ? theme.palette.text.disabled : "rgba(0,0,0,0.4)",
            },
            "& .ql-container": { minHeight: 400 },
            "& .ql-editor": { height: { xs: 400, sm: 440, md: 480 }, overflowY: "auto" },
            "& .ql-toolbar": { borderTopLeftRadius: 6, borderTopRightRadius: 6 },
            "& .ql-container": { borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
          }}>
            <ReactQuill
              theme="snow"
              value={contentHtml}
              onChange={setContentHtml}
              modules={modules}
              formats={formats}
              placeholder="내용을 입력하세요…"
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" gap={1.5} mt={2}>
          <FormControlLabel
            control={
              <Checkbox checked={pinned} onChange={(e) => setPinned(e.target.checked)} color="primary" size="small" />
            }
            label="상단 고정"
            sx={{ m: 0 }}
          />
          <Button variant="contained" onClick={handleSubmit} size="large" disabled={submitting}>
            {submitting ? "저장 중…" : (mode === "edit" ? "수정하기" : "등록")}
          </Button>
        </Box>
      </Grid>
      <Grid size={isMobile ? 1 : 3} />
    </Grid>
  );
}