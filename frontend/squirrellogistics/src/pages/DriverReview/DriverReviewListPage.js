import { Box } from "@mui/material";
import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";
import { useParams } from "react-router-dom";
import ReviewListComponent from "../../components/driverReview/ReviewListComponent";

const DriverReviewListPage = () => {
    const { driverId } = useParams();

    return (
        <Box>
            <DriverHeader_Temp />
            <ReviewListComponent driverId={driverId}/>
        </Box>
    );
}
export default DriverReviewListPage;