import { Box, Button, Grid, Typography } from "@mui/material";
import logo from "../../pages/Driver/images/logo.jpg";
import { useNavigate, useParams } from "react-router-dom";
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";

const EmptyDeliveryTrackingComponent = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();

  const onClickMove = () => {
    navigate(`/driver/list`);
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      {/* 제목 영역 */}
      <Box
        sx={{ bgcolor: theme.palette.background.paper, py: 4, minHeight: 190 }}
      >
        <CommonTitle>현재 운송 정보</CommonTitle>
      </Box>

      {/* 빈 상태 컨텐츠 */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ py: 8, px: 4 }}
      >
        <img
          src={logo}
          alt="logo"
          style={{ maxWidth: "240px", marginBottom: "20px" }}
        />
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontSize: "clamp(14px, 1.5vw, 16px)",
            textAlign: "center",
            fontWeight: "bold",
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          현재 진행 중인 운송 내역이 없습니다.
          <br />
          지금 운송 요청 목록을 확인하러 가시겠습니까?
        </Typography>
        <Button
          variant="contained"
          onClick={onClickMove}
          sx={{
            fontSize: "clamp(14px, 1.5vw, 16px)",
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          운송 목록으로 가기
        </Button>
      </Box>
    </Box>
  );
};
export default EmptyDeliveryTrackingComponent;
