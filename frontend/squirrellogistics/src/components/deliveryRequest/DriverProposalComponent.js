import { Box, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import { formatAddress, formatDistanceKm } from "./deliveryFormatUtil";
import { useNavigate, useParams } from "react-router-dom";

export function formatRemaining(isoString) {
    if (!isoString) return '';
    const target = new Date(isoString);
    if (Number.isNaN(target.getTime())) return '';

    const now = new Date();
    let diffMs = target - now;
    if (diffMs <= 0) return '만료됨';

    const minutes = Math.floor(diffMs / 60000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    const parts = ["자동 취소까지: "];
    if (days > 0) parts.push(`${days}일`);
    if (hours > 0) parts.push(`${hours}시간`);
    if (mins > 0) parts.push(`${mins}분`);
    return `${parts.join(' ')}`;
};

const DriverProposalComponent = ({ open, proposals, onClose }) => {

    const { driverId } = useParams();
    const navigate = useNavigate();
    const thisTheme = useTheme();

    const handleClick = (requestId, refundDate) => {
        navigate(`/driver/detail/${requestId}`, {
            state: { isProposed: true, refundDate: refundDate }
        });
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            scroll="paper"
            PaperProps={{ sx: { borderRadius: 2, borderColor:"black", maxHeight: '60vh', pr: 1 } }}
        >
            <DialogTitle >
                <Box display="flex" alignItems="center" pt={2}>
                    {/* 가운데 제목 */}
                    <Typography
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            fontFamily: 'inherit',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: thisTheme.palette.text.primary,
                        }}
                    >
                        지명 운송 요청
                    </Typography>

                    {/* 우측 닫기 버튼 */}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 25,
                            top: 28,
                            color: '#888',
                        }}
                    >
                        <CloseIcon />
                        
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent >
                <Grid container direction={"column"} justifyContent={"center"} spacing={1} mb={2}
                >
                      <Typography
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            fontFamily: 'inherit',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: '#909095',
                        }}
                    >
                        [안내] 기사님께서 수락을 거절하거나, 무응답으로<br/>지명 취소 기일을 넘긴 지명 요청은 공개 요청으로 자동 전환됩니다.
                    </Typography>
                    {proposals.map((item, idx) => (
                        <Grid item mt={2}>
                            <Paper
                                onClick={() => handleClick(item.requestId, item.refundDate)}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    border: '1px solid #2a2a2a5d',
                                    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 1.5,
                                    fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif'
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">{formatAddress(item.startAddress)} → {formatAddress(item.endAddress)}</Typography>


                                <Typography variant="body2" sx={{ color: 'gray' }}>
                                    {formatDistanceKm(item.distance)}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box display="flex" justifyContent="space-between">
                                    <Typography sx={{ fontWeight: 'bold' }}>수익: {item.estimatedFee.toLocaleString()}원</Typography>
                                    <Typography variant="body1" sx={{ color: 'gray' }}>{formatRemaining(item.refundDate)}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}


                </Grid>
            </DialogContent>


        </Dialog>
    );
}
export default DriverProposalComponent;

