import React, { useState } from "react";
import {
    Box, Button, Grid, TextField,
    FormControlLabel, Checkbox,
    useTheme,
    Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import { CommonTitle } from "../../components/common/CommonText";
import { useNavigate } from "react-router-dom";

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

const formats = [
    "header", "bold", "italic", "underline", "strike",
    "color", "background",
    "list", "bullet",
    "align",
    "link", "blockquote", "code-block",
];

const NoticePublishPage = ({ onClose, onSubmit }) => {
    const theme = useTheme();
    const [title, setTitle] = useState("");
    const [contentHtml, setContentHtml] = useState("");
    const [pinned, setPinned] = useState(false);

    const navigate = useNavigate();
    const handleSubmit = () => {
        const safeHtml = DOMPurify.sanitize(contentHtml, { USE_PROFILES: { html: true } });
        onSubmit?.({ title, content: safeHtml, pinned });
        onClose?.();
    };

    return (
        <>
            <CommonTitle>새 공지 작성</CommonTitle>
            <Grid container justifyContent="center" marginBottom={0} minHeight="100vh">
                <Grid size={3} />
                <Grid size={6}>
                    <Box display="flex" justifyContent="flex-start" mb={2} mt={0}>
                        <Chip
                            icon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                            label="전체 목록 이동"
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() =>
                                navigate('/admin/notice/list')
                            }
                            sx={{
                                height: 24,
                                fontSize: 12,
                                fontWeight: 'bold',
                                px: 0.5,
                            }}
                        />
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                            <TextField
                                label="제목"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 240 }}
                            />

                        </Box>

                        {/* Quill Editor 스타일 */}
                        <Box
                            sx={{

                                // 에디터/툴바 보더/배경
                                "& .ql-toolbar.ql-snow": {
                                    borderColor: theme.palette.divider,
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.background.default
                                            : theme.palette.background.paper,
                                },
                                "& .ql-container.ql-snow": {
                                    borderColor: theme.palette.divider,
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.background.paper
                                            : theme.palette.common.white,
                                },
                                "& .ql-editor": {
                                    color: theme.palette.text.primary,
                                },
                                // placeholder 색
                                "& .ql-editor.ql-blank::before": {
                                    color:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.text.disabled
                                            : "rgba(0,0,0,0.4)",
                                },
                                // 아이콘/피커 색상
                                "& .ql-snow .ql-stroke": {
                                    stroke:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.text.primary
                                            : undefined,
                                },
                                "& .ql-snow .ql-fill": {
                                    fill:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.text.primary
                                            : undefined,
                                },
                                "& .ql-toolbar .ql-picker, & .ql-toolbar .ql-picker-label": {
                                    color:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.text.secondary
                                            : undefined,
                                },
                                "& .ql-toolbar .ql-picker-options": {
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.background.paper
                                            : undefined,
                                    borderColor:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.divider
                                            : undefined,
                                },
                                // hover/active 
                                "& .ql-toolbar button:hover .ql-stroke, & .ql-toolbar button.ql-active .ql-stroke":
                                {
                                    stroke:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.primary.main
                                            : undefined,
                                },
                                "& .ql-toolbar button:hover .ql-fill, & .ql-toolbar button.ql-active .ql-fill":
                                {
                                    fill:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.primary.main
                                            : undefined,
                                },
                                // 링크 색
                                "& .ql-editor a": {
                                    color: theme.palette.primary.main,
                                },

                                // 높이
                                "& .ql-container": { minHeight: 400 },
                                "& .ql-editor": {
                                    height: { xs: 400, sm: 440, md: 480 },
                                    overflowY: "auto",
                                },
                                "& .ql-toolbar": {
                                    borderTopLeftRadius: 6,
                                    borderTopRightRadius: 6,
                                },
                                "& .ql-container": {
                                    borderBottomLeftRadius: 6,
                                    borderBottomRightRadius: 6,
                                },
                            }}
                        >
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
                                <Checkbox
                                    checked={pinned}
                                    onChange={(e) => setPinned(e.target.checked)}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label="최상단 고정"
                            sx={{ m: 0 }}
                        />
                        <Button variant="contained" onClick={handleSubmit} size="large">등록</Button>
                    </Box>
                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    );
};

export default NoticePublishPage;