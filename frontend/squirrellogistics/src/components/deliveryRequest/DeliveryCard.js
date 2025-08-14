import { Paper, Typography, Divider, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDeliveryDTO } from './deliveryFormatUtil';

const DeliveryCard = ({item}) => {

    const { driverId } = useParams();
    const navigate = useNavigate();
    const formatted = formatDeliveryDTO(item); // 여기서 포맷 수행

    const handleClick = () => {
        navigate(`/driver/${driverId}/detail/${item.requestId}`);
    };
    return (
        <Paper
            onClick={handleClick}
            sx={{
                p: 2,
                mb: 2,
                border: '1px solid #2a2a2a5d',
                boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: 1.5,
                fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif'
            }}
        >
            <Typography variant="subtitle1" fontWeight="bold">
                {formatted.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'gray' }}>
                {formatted.distance}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                {formatted.warning}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontWeight: 'bold' }}>{formatted.profit}</Typography>
                <Typography sx={{ color: 'gray' }}>{formatted.registered}</Typography>
            </Box>
        </Paper>
    );
};

export default DeliveryCard;