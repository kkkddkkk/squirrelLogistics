import { Box } from "@mui/material";
import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";
import DriverMonthlyComponent from "../../components/driverSchedule/DriverMonthlyComponent";
import { useParams } from "react-router-dom";

const DriverMonthlyPage = () => {
    const { driverId } = useParams();
    const { month } = useParams();
    const { year } = useParams();


    
    return (
        <Box>
            <DriverHeader_Temp />
            <DriverMonthlyComponent driverId={driverId}/>
        </Box>
    );
}
export default DriverMonthlyPage;