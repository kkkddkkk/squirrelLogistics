import { Box, Button, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import logo from "../../components/common/squirrelLogisticsLogo.png";
import darkLogo from "../../components/common/squirrelLogisticsLogo_dark.png";
import { useNavigate, useParams } from "react-router-dom";
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";


const EmptyDeliveryTrackingComponent = () => {
  const thisTheme = useTheme();
  const { driverId } = useParams();
  const navigate = useNavigate();
  const isSmaller900 = useMediaQuery(thisTheme.breakpoints.down('md'));

  const onClickMove = () => {
    navigate(`/driver/list`);
  };

  return (
    <Box sx={{ bgcolor: thisTheme.palette.background.default, minHeight: isSmaller900 ? "60vh" : "80vh" }}>
      {/* 제목 영역 */}
      <Box
        sx={{ bgcolor: thisTheme.palette.background.default, py: 4, minHeight:  isSmaller900 ? 100 :190 }}
      >
        <CommonTitle>현재 운송 정보</CommonTitle>
      </Box>

      {/* 빈 상태 컨텐츠 */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ py: 4, px: 4 }}
      >
        <img
          src={thisTheme.palette.mode === "light" ? logo : darkLogo}
          alt="logo"
          style={{ maxWidth: isSmaller900 ? "140px" : "240px", marginBottom: "20px" }}
        />
        <Typography
          variant="h6"
          sx={{
            color: thisTheme.palette.text.primary,
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
          }}
        >
          운송 목록으로 가기
        </Button>
      </Box>
    </Box>
  );
};
export default EmptyDeliveryTrackingComponent;
