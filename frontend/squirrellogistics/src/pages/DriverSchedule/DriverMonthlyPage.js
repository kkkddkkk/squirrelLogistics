import { Box } from "@mui/material";
import DriverMonthlyComponent from "../../components/driverSchedule/DriverMonthlyComponent";
import { useParams } from "react-router-dom";
import { theme } from "../../components/common/CommonTheme";
import Header from "../Layout/Header"
import Footer from "../Layout/Footer"

const DriverMonthlyPage = () => {
  const { month } = useParams();
  const { year } = useParams();

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Header />
      <DriverMonthlyComponent/>
      <Footer />
    </Box>
  );
};
export default DriverMonthlyPage;
