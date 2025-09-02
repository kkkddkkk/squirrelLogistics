import {Box} from '@mui/material';
import ListComponent from '../../components/deliveryRequest/ListComponent';
import Header from '../Layout/Header';
import Footer from "../Layout/Footer"


const ListPage = () => {
    return (
        <Box>
            <Header/>
            <ListComponent/>
            <Footer />
        </Box>
    );
}
export default ListPage;