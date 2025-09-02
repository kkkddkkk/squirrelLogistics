import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button,
    Grid
} from '@mui/material';

function OneButtonPopupComponent({
    open,
    title,
    content,
    btnTxt = '확인',
    onClick = () => { },
    maxWidth = 'xs',
}) {
    const handleGuardedClose = (event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    };

    return (
        <Dialog
            open={open}
            onClose={handleGuardedClose}
            disableEscapeKeyDown
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, border: '1px solid #5e5e5eff'} }}
        >
            {title && (
                <DialogTitle sx={{ pt: 2, pb: 4 }}>
                    <Box display="flex" alignItems="center">
                        <Typography
                            sx={{
                                flexGrow: 1,
                                textAlign: 'center',
                                fontFamily: 'inherit',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#2A2A2A',
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                </DialogTitle>
            )}

            {content && (
                <DialogContent sx={{ pb: 4 }}>
                    <Box display="flex" alignItems="center">
                        <Typography
                            sx={{
                                flexGrow: 1,
                                textAlign: 'center',
                                fontFamily: 'inherit',
                                fontSize: '1.0rem',
                                color: '#2A2A2A',
                            }}
                        >
                            {content}
                        </Typography>
                    </Box>
                </DialogContent>
            )}


            <DialogActions sx={{ px: 2.5, pb: 2.5, justifyContent: "space-around" }}>
                <Button
                    variant="contained"
                    onClick={onClick}
                    sx={{ minWidth: 120, bgcolor: '#113F67' }}
                >
                    {btnTxt}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OneButtonPopupComponent;