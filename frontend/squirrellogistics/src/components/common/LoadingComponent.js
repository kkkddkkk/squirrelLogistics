import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

export default function LoadingComponent({ open, text = '로딩중...' }) {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
      open={open}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress />
        <Typography>{text}</Typography>
      </Box>
    </Backdrop>
  );
}