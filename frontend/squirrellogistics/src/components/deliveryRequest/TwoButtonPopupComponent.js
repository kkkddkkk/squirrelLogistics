import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button,
    Grid,
    useTheme
} from '@mui/material';
import { FONT_SIZE } from './ListComponent';
import { FONT_SIZE_SMALL_TITLE } from '../common/CommonText';

function TwoButtonPopupComponent({
    open,
    title,
    content,
    leftTxt = '취소',
    rightTxt = '확인',
    onLeftClick = () => { },
    onRightClick = () => { },
    maxWidth = 'xs',
}) {

    const thisTheme = useTheme();

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
                <DialogTitle sx={{ pt: 2, pb: 4 }}>
                    <Box display="flex" alignItems="center">
                        <Typography
                            sx={{
                                flexGrow: 1,
                                textAlign: 'center',
                                fontFamily: 'inherit',
                                fontSize: FONT_SIZE_SMALL_TITLE,
                                fontWeight: 'bold',
                                color: thisTheme.palette.text.primary,
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
                                fontSize: FONT_SIZE,
                                color: thisTheme.palette.text.primary,
                            }}
                        >
                            {content}
                        </Typography>
                    </Box>
                </DialogContent>
            )}


            <DialogActions sx={{ px: 2.5, pb: 2.5, justifyContent: "space-around" }}>
                <Button
                    variant="outlined"
                    size='large'
                    onClick={onLeftClick}
                    sx={{
                        minWidth: 120,
                        fontSize: FONT_SIZE
                    }}
                >
                    {leftTxt}
                </Button>

                <Button
                    variant="contained"
                    onClick={onRightClick}
                    sx={{
                        minWidth: 120,
                        fontSize: FONT_SIZE
                    }}
                >
                    {rightTxt}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TwoButtonPopupComponent;