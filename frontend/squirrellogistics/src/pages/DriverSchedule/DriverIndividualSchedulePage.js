import { Box } from "@mui/material";

import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";
import DriverIndividualScheduleComponent from "../../components/driverSchedule/DriverIndividualScheduleComponent";
import { useLocation, useParams } from "react-router-dom";

const DriverIndividualSchedulePage = () => {
    const { driverId, scheduleId } = useParams();     
    const { state } = useLocation();                 
    const event = state?.event;

    return (
        <Box>
            <DriverHeader_Temp />
            <DriverIndividualScheduleComponent event={event} />
        </Box>
    );
}
export default DriverIndividualSchedulePage;