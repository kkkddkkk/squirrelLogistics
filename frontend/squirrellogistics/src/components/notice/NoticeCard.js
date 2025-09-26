import React from "react";
import PushPinIcon from '@mui/icons-material/PushPin';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Card, CardContent, Typography, Button, Box, Grid, Stack, useTheme, colors, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteNotice, toggleNoticePinned } from "../../api/notice/noticeAPI";

export default function NoticeCard({ notice, isAdmin, isMobile, refresh }) {
  const t = useTheme();
  const navigate = useNavigate();

  const handleToggle = async (e) => {
    e.stopPropagation();
    await toggleNoticePinned(notice.noticeId, !notice.pinned);
    refresh();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (isAdmin) {
      navigate(`/admin/notice/edit/${notice.noticeId}`);
    }
  };

  const handleClickCard = () => {
    if (isAdmin) {
      navigate(`/admin/notice/read/${notice.noticeId}`);
    } else {
      navigate(`/notice/read/${notice.noticeId}`)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await deleteNotice(notice.noticeId);
    refresh();
  };

  return (
    <Card sx={(t) => ({
      bgcolor: t.palette.mode === 'dark' ? t.palette.background.default : t.palette.grey[50],
      borderLeft: notice.pinned && `3px solid ${t.palette.primary.main}`,
    })}>
      <CardContent
        onClick={handleClickCard}
        sx={{ px: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}
      >
        <Grid
          container
          alignItems={isMobile ? "flex-start" : "center"}
          justifyContent={isMobile ? "flex-start" : "space-between"}
          wrap="nowrap"
          columnSpacing={1}
          direction={isMobile ? "column" : "row"}
        >
          <Grid item xs zeroMinWidth>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PushPinIcon
                fontSize="small"
                sx={{
                  visibility: notice.pinned ? 'visible' : 'hidden',
                  color: notice.pinned ? t.palette.primary.main : 'inherit',
                  flex: '0 0 auto',
                }}
                titleAccess="고정됨"
                aria-hidden={!notice.pinned}
              />
              <Box minWidth={0}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, lineHeight: 1.25, fontSize: '0.95rem' }}>
                  {notice.title}
                </Typography>
                <Typography variant="caption">등록일: {notice.createdAt}</Typography>
              </Box>
            </Stack>
          </Grid>

          {isAdmin && (
            <Grid item
              alignSelf={isMobile ? "center" : "inherit"}
              onClick={(e) => e.stopPropagation()}>
              <Stack direction={"row"} spacing={1} alignItems="center">
                <Button variant="outlined" size="small" onClick={handleToggle}>
                  {notice.pinned ? "해제" : "고정"}
                </Button>
                <Button variant="outlined" size="small" onClick={handleEdit}>
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDelete}
                  sx={(t) => ({
                    borderColor: t.palette.error.main,
                    color: t.palette.error.main,
                    '&:hover': { backgroundColor: t.palette.error.main, color: t.palette.getContrastText(t.palette.error.main) },
                  })}
                >
                  삭제
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}