import { Box } from "@mui/material";

import DriverIndividualScheduleComponent from "../../components/driverSchedule/DriverIndividualScheduleComponent";
import { useLocation, useParams } from "react-router-dom";
import Header from "../Layout/Header";

const DriverIndividualSchedulePage = () => {
    const { driverId, scheduleId } = useParams();     
    const { state } = useLocation();                 
    const event = state?.event;

    return (
        <Box>
            <Header />
            <DriverIndividualScheduleComponent event={event} />
        </Box>
    );
}
export default DriverIndividualSchedulePage;