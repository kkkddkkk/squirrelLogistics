import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import { useState } from "react";

export default function DeliveryWaypointPopupComponent({ waypoints, open, onClose }) {

    const [waypointsData, setWaypointsData] = useState(waypoints);


    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle mb={2}>
                <Box display="flex" alignItems="center">
                    {/* 가운데 제목 */}
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
                        경유지 정보
                    </Typography>

                    {/* 우측 닫기 버튼 */}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: '#888',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent >
                <Grid container direction={"column"} justifyContent={"center"} spacing={1} mb={4}>

                    {waypointsData.map((item, idx) => (
                        <Grid item>
                            <Paper variant="outlined" sx={{ p: 1, borderColor: "#bbc5d0" }}>
                                <Grid container direction={"row"} justifyContent={"space-between"}>
                                    <Box variant="outlined"
                                        sx={{
                                            backgroundColor: "#bbc5d0", 
                                            textAlign:"center",
                                            borderRadius: 1,
                                            width:"20px"
                                        }}
                                    ><strong>{idx + 1}</strong></Box>
                                    <Typography variant="body2">{item.address}</Typography>
                                </Grid>
                            </Paper>
                        </Grid>

                    ))}
                </Grid>
            </DialogContent>


        </Dialog>
    );
}