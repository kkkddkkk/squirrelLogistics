import { Box } from "@mui/material";
import Header from "../Layout/Header"
import Footer from "../Layout/Footer"
import { useParams } from "react-router-dom";
import ReviewListComponent from "../../components/driverReview/ReviewListComponent";
import { theme } from "../../components/common/CommonTheme";

const DriverReviewListPage = () => {
  const { driverId } = useParams();

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Header />
      <ReviewListComponent driverId={driverId} />
      <Footer />
    </Box>
  );
};
export default DriverReviewListPage;
