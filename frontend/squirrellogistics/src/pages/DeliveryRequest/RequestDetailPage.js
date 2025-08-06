import { Box } from "@mui/material";
import DriverHeader_Temp from "../../components/deliveryRequest/DriverHeader_Temp";
import RequestDetailComponent from "../../components/deliveryRequest/RequestDetailComponent";
import { useLocation, useParams } from "react-router-dom";


const RequestDetailPage = () => {
    const location = useLocation();
    const { item } = location.state || {};
    const { request_id } = useParams();

    return (
        <Box>
            <DriverHeader_Temp />
            <RequestDetailComponent item={item}/>
        </Box>
    );
}
export default RequestDetailPage;