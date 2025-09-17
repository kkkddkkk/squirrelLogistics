import React, { useMemo } from "react";
import { Box, Paper, Typography, Stack, Chip, Button, Divider, useTheme } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css"; // Quill 서식 적용

/**
 * props:
 * - data: { title, content(HTML), viewCount, pinned, writer, bannerFileName, createdAt }
 * - isAdmin: boolean
 * - onBack: () => void
 * - onEdit: () => void
 */
export default function NoticeDetail({ data, isAdmin, onBack, onEdit }) {
  const t = useTheme();

  const safeHtml = useMemo(
    () => DOMPurify.sanitize(data?.content ?? "", { USE_PROFILES: { html: true } }),
    [data?.content]
  );

  // bannerFileName이 절대/루트경로면 그대로 노출
  const bannerSrc =
    data?.bannerFileName &&
    (data.bannerFileName.startsWith("http") || data.bannerFileName.startsWith("/"))
      ? data.bannerFileName
      : null;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor:
          data?.pinned && theme.palette.mode === "light"
            ? theme.palette.grey[50]
            : theme.palette.background.paper,
      })}
    >
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <PushPinIcon
            fontSize="small"
            sx={{
              color: data?.pinned ? t.palette.primary.main : t.palette.text.disabled,
              visibility: data?.pinned ? "visible" : "hidden",
            }}
            titleAccess="고정됨"
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {data?.title}
          </Typography>
          {data?.pinned && <Chip size="small" color="primary" label="고정" variant="outlined" />}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="text" size="small" onClick={onBack}>목록</Button>
          {isAdmin && (
            <Button variant="contained" size="small" onClick={onEdit}>
              수정하기
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 메타 */}
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
        {data?.writer ? `${data.writer} · ` : ""}
        {data?.createdAt}
        {typeof data?.viewCount === "number" ? ` · 조회 ${data.viewCount}` : ""}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* 배너(있으면) */}
      {bannerSrc && (
        <Box
          component="img"
          src={bannerSrc}
          alt="배너 이미지"
          sx={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 1, mb: 2 }}
        />
      )}

      {/* 본문: Quill HTML 렌더링 */}
      <Box
        className="ql-editor" // quill css와 궁합
        sx={{
          p: 0,
          "& img": { maxWidth: "100%", height: "auto" },
          "& blockquote": { borderLeft: `3px solid ${t.palette.divider}`, pl: 2, color: "text.secondary" },
          "& pre": { bgcolor: t.palette.action.hover, p: 1.5, borderRadius: 1, overflowX: "auto" },
        }}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </Paper>
  );
}