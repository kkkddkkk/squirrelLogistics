import {Box} from '@mui/material';
import ListComponent from '../../components/deliveryRequest/ListComponent';
import DriverHeader_Temp from '../../components/deliveryRequest/DriverHeader_Temp';


const ListPage = () => {
    return (
        <Box>
            <DriverHeader_Temp/>
            <ListComponent/>
        </Box>
    );
}
export default ListPage;