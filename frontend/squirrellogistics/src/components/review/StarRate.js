import StarIcon from '@mui/icons-material/Star';
import { Box } from '@mui/material';
import { forwardRef, useEffect } from 'react';

const StarRate = ({ scope, setScope, modifying, size }) => {

    const StarUseRef = forwardRef((props, ref) => <StarIcon {...props} ref={ref} />);

    const Star = ({ rate }) => {
        const handleClick = () => {
            if (modifying) setScope(rate);
        };

        return (
            <StarUseRef
                sx={{
                    color: scope >= rate ? "#E8A93F" : "#909095",
                    cursor: modifying ? "pointer" : "default",
                    fontSize: size
                }}
                onClick={handleClick}
            />
        );
    };

    return (
        <Box display="flex">
            {[1, 2, 3, 4, 5].map((r) => (
                <Star key={r} rate={r} />
            ))}
        </Box>
    );
};
export default StarRate;