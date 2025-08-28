import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';

function CompleteConfirmDialog({
    open,
    onClose,
    onConfirm
}) {
    const [mountainous, setMountainous] = useState(false);
    const [caution, setCaution] = useState(false);

    const handleConfirm = () => {
        // 부모 컴포넌트로 체크 값 전달
        onConfirm({ mountainous, caution });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
                onClose();
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle>
                <Box textAlign="center">
                    <Typography
                        sx={{
                            fontFamily: 'inherit',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#2A2A2A',
                        }}
                    >
                        운송 완료 확인
                    </Typography>
                </Box>
            </DialogTitle>

            {/* <DialogContent dividers>
                <Typography mb={2}>
                    다음과 같은 사항이 있었다면 체크해 주세요.
                </Typography>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={mountainous}
                                onChange={(e) => setMountainous(e.target.checked)}
                            />
                        }
                        label="예상 외 산간 지역 포함"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={caution}
                                onChange={(e) => setCaution(e.target.checked)}
                            />
                        }
                        label="기재되지 않은 취급주의 화물 존재"
                    />
                </FormGroup>
            </DialogContent> */}

            <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ borderColor: '#113F67', color: '#113F67' }}
                >
                    취소
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    sx={{ bgcolor: '#113F67' }}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CompleteConfirmDialog;