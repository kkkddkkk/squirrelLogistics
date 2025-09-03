import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Typography,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function DeliveryWaypointPopupComponent({ waypoints = [], open, onClose }) {
    // 0번(상차지) 제외한 하차지들만 사용
    const drops = waypoints.slice(1); // [1..N]
    const thisTheme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1.5, pt: 2 } }}>
            <DialogTitle pt={4} mb={2}>
                <Box display="flex" alignItems="center">
                    <Typography
                        sx={{
                            flexGrow: 1,
                            textAlign: "center",
                            fontFamily: "inherit",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: thisTheme.palette.text.primary,
                        }}
                    >
                        하차지 정보
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ position: "absolute", right: 20, top: 28, color: thisTheme.palette.text.secondary }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                {drops.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                        하차지가 없습니다.
                    </Typography>
                ) : (
                    <Grid container direction="column" spacing={1} mb={1}>
                        {drops.map((item, i) => {
                            const number = i + 1; // 1부터 시작
                            const isFinal = i === drops.length - 1;
                            return (
                                <Grid item key={item.waypointId ?? `${item.address}-${i}`}>
                                    <Paper variant="outlined"
                                        sx={{
                                            p: 1,
                                            mb: 1,
                                            border: '1px solid #2a2a2a5d',
                                            boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                            borderRadius: 1.5,
                                            fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif',
                                            backgroundColor: thisTheme.palette.background.default
                                        }}>
                                        <Grid container alignItems="center" justifyContent="space-between" wrap="nowrap">
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    lineHeight: "28px",
                                                    fontWeight: 700,
                                                    ml: 1,
                                                    mr: 1.2,
                                                    color: thisTheme.palette.text.primary
                                                }}
                                            >
                                                {number}
                                            </Box>
                                            <Typography variant="body2" sx={{ color: thisTheme.palette.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {item.address}{" "}
                                                {isFinal && (
                                                    <Box component="span" sx={{ color: thisTheme.palette.text.primary, fontWeight: "bold" }}>
                                                        · 최종
                                                    </Box>
                                                )}
                                            </Typography>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </DialogContent>
        </Dialog>
    );
}