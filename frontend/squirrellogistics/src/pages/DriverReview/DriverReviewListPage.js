import { Box } from "@mui/material";
import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";
import { useParams } from "react-router-dom";
import ReviewListComponent from "../../components/driverReview/ReviewListComponent";
import { theme } from "../../components/common/CommonTheme";

const DriverReviewListPage = () => {
  const { driverId } = useParams();

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <DriverHeader_Temp />
      <ReviewListComponent driverId={driverId} />
    </Box>
  );
};
export default DriverReviewListPage;
