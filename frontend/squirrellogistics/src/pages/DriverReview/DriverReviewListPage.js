import { Box, useTheme } from "@mui/material";
import Header from "../Layout/Header"
import Footer from "../Layout/Footer"
import { useParams } from "react-router-dom";
import ReviewListComponent from "../../components/driverReview/ReviewListComponent";
import { theme } from "../../components/common/CommonTheme";

const DriverReviewListPage = () => {
  const { driverId } = useParams();
  const thisTheme = useTheme();

  return (
    <Box sx={{ bgcolor: thisTheme.palette.background.default, minHeight: "100vh" }}>
      <Header />
      <ReviewListComponent driverId={driverId} />
      <Footer />
    </Box>
  );
};
export default DriverReviewListPage;
