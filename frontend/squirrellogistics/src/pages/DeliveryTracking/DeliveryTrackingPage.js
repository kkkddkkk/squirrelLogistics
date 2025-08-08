import {Box} from '@mui/material';
import { useState } from 'react';
import DriverHeader_Temp from '../../components/deliveryRequest/DriverHeader_Temp';
import DeliveryTrackingComponent from '../../components/deliveryTracking/DeliveryTrackingComponent';
import EmptyDeliveryTrackingComponent from '../../components/deliveryTracking/EmptyDeliveryTrackingComponent';



const DeliveryTrackingPage = () => {

    const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
    return (
        <Box>
            <DriverHeader_Temp/>
            {hasActiveDelivery ? <DeliveryTrackingComponent /> : <EmptyDeliveryTrackingComponent />}
        </Box>
    );

    
};

export default DeliveryTrackingPage;