import { Paper, Typography, Divider, Box, useTheme, useMediaQuery, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { formatDeliveryDTO } from "./deliveryFormatUtil";
import { theme } from "../common/CommonTheme";
import { CommonSmallerTitle, CommonSmallerTitleMedia } from "../common/CommonText";
import { FONT_SIZE } from "./ListComponent";

const DeliveryCard = ({ item }) => {
  const { driverId } = useParams();
  const thisTheme = useTheme();
  const navigate = useNavigate();
  const isSmaller900 = useMediaQuery(theme.breakpoints.down('md'));
  const formatted = formatDeliveryDTO(item, isSmaller900); // 여기서 포맷 수행

  const handleClick = () => {
    navigate(`/driver/detail/${item.requestId}`);
  };
  return (
    <Paper
      onClick={handleClick}
      sx={{
        p: 2,
        mb: 2,
        border: "0.8px solid",
        borderColor: thisTheme.palette.text.secondary,
        boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 1.5,
        fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
        cursor: "pointer",
        transition: "all 0.3s ease",
        bgcolor: thisTheme.palette.background.paper,
        "&:hover": {
          bgcolor: thisTheme.palette.background.default,
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          borderColor: thisTheme.palette.primary.main,
        },
      }}
    >
      <CommonSmallerTitleMedia>{formatted.title}</CommonSmallerTitleMedia>


      <Grid container
        direction={isSmaller900 ? "row" : "column"}
        justifyContent={isSmaller900 ? "space-between" : "flex-start"}
      >

        <Typography variant="body2"
          sx={{
            color: thisTheme.palette.text.secondary,
            fontSize: FONT_SIZE
          }}>
          {formatted.distance}
        </Typography>

        <Typography variant="body2"
          sx={{
            color: thisTheme.palette.text.secondary,
            fontSize: FONT_SIZE
          }}>
          총 하차지: {item.waypointCount - 1}곳
        </Typography>
      </Grid>
      <Divider sx={{ my: 1 }} />

      <Box display="flex" justifyContent="space-between">
        <Typography
          sx={{ 
            fontWeight: "bold", 
            color: thisTheme.palette.text.primary,
            fontSize: FONT_SIZE 
          }}
        >
          {formatted.profit}
        </Typography>
        <Typography sx={{ color: thisTheme.palette.text.secondary, fontSize: FONT_SIZE }}>
          {formatted.registered}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DeliveryCard;
