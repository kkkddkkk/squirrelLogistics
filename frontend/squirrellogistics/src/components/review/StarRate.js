import StarIcon from '@mui/icons-material/Star';
import { Box } from '@mui/material';
import { forwardRef } from 'react';

const StarRate = ({ scope, setScope, modifying }) => {
    const StarUseRef = forwardRef((props, ref) => (
        <StarIcon {...props} ref={ref} />
    ));


    const Star = ({ ref, rate }) => {
        
        return (
            <StarUseRef
                sx={{
                    color: scope>=rate && modifying?"#E8A93F":"#909095",
                    cursor: modifying ? "pointer" : ""
                }}
                ref={ref}
                onClick={() => setScope(rate)}
            />

        )
    }

    return (
        <Box display={'flex'}>
            <Star rate={1} />
            <Star rate={2} />
            <Star rate={3} />
            <Star rate={4} />
            <Star rate={5}/>
        </Box>
    )
}
export default StarRate;