import { Box } from "@mui/material";
import RequestDetailComponent from "../../components/deliveryRequest/RequestDetailComponent";
import { useLocation, useParams } from "react-router-dom";
import Header from "../Layout/Header";


const RequestDetailPage = () => {
    const location = useLocation();
    const { item } = location.state || {};
    const { requestId } = useParams();

    return (
        <Box>
            <Header />
            <RequestDetailComponent item={item}/>
        </Box>
    );
}
export default RequestDetailPage;