import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button,
    Grid
} from '@mui/material';

function TwoButtonPopupComponent({
    open,
    title,
    content,
    children,
    leftTxt = '취소',
    rightTxt = '확인',
    onLeftClick = () => { },
    onRightClick = () => { },
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
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {title && (
                <DialogTitle sx={{ pt: 3, pb: 1 }}>
                    <Box display="flex" alignItems="center">
                        <Typography
                            sx={{
                                flexGrow: 1,
                                textAlign: 'center',
                                fontFamily: 'inherit',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#2A2A2A',
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                </DialogTitle>
            )}

            <DialogContent dividers>
                {content ?? children}
            </DialogContent>

            <DialogActions sx={{ px: 2.5, pb: 2.5}}>
                <Grid container direction={"row"} spacing={1} justifyContent={"space-between"}>
                    <Grid item>
                        <Button
                            variant="outlined"
                            onClick={onLeftClick}
                            sx={{ borderColor: '#113F67', color: '#113F67' }}
                        >
                            {leftTxt}
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={onRightClick}
                            sx={{ bgcolor: '#113F67' }}
                        >
                            {rightTxt}
                        </Button>
                    </Grid>

                </Grid>

            </DialogActions>
        </Dialog>
    );
}

export default TwoButtonPopupComponent;