import { Paper, Typography, Divider, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { formatDeliveryDTO } from "./deliveryFormatUtil";
import { theme } from "../common/CommonTheme";
import { CommonSmallerTitle } from "../common/CommonText";

const DeliveryCard = ({ item }) => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const formatted = formatDeliveryDTO(item); // 여기서 포맷 수행

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
        borderColor: theme.palette.primary.light,
        boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 1.5,
        fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
        cursor: "pointer",
        transition: "all 0.3s ease",
        bgcolor: theme.palette.background.paper,
        "&:hover": {
          bgcolor: theme.palette.background.default,
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CommonSmallerTitle>{formatted.title}</CommonSmallerTitle>

      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        {formatted.distance}
      </Typography>

    

      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        총 하차지: {item.waypointCount -1}곳
      </Typography>
      <Divider sx={{ my: 1 }} />

      <Box display="flex" justifyContent="space-between">
        <Typography
          sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
        >
          {formatted.profit}
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary }}>
          {formatted.registered}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DeliveryCard;
