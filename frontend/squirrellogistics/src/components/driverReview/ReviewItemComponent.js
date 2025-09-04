import React, { useState } from "react";
import {
    Paper, Grid, Box, Stack, Typography, Rating, Divider, Button, Collapse,
    useTheme
} from "@mui/material";
import EmergencyReportModal from "../driver/EmergencyReportModal";
import LoadingComponent from "../common/LoadingComponent";
import { useNavigate } from "react-router-dom";
import { fetchRegisterReport } from "../../api/company/reportApi";

const textSx = {
    fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif',
    color: '#2A2A2A',
    fontSize: 'clamp(14px, 1vw, 16px)'
};
const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';
const snippet = (s, n = 40) => (s?.length > n ? s.slice(0, n) + '…' : s ?? "");


export default function ReviewItem({ review, expanded, onToggle }) {
    const thisTheme = useTheme();
    const navigate = useNavigate();
    const [showReport, setShowReport] = useState(false);
    const [loading, setLoading] = useState(false);

    const onReportClick = () => {
        setShowReport(true);
    }


    const handleEmergencyReport = (reportData) => {
        console.log("긴급 신고 데이터:", reportData);

        setLoading(true);
        fetchRegisterReport({ reportData })
            .then((data) => {
                console.log(data);
            })
            .catch((e) => {
                // const errBody = e.response?.data;
                // setError(errBody?.message ?? e.message);
            })
            .finally(() => {
                setLoading(false);
                navigate(`/driver/reportlist`);
            });
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                borderColor: "#bbc5d0",
                width: "100%",
                boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.05)'
            }}
        >
            <LoadingComponent open={loading} text="신고 등록 중..." />
            <Grid container alignItems="flex-start" justifyContent="space-between">
                <Box flex={1} minWidth={0}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Rating
                            value={review.rating ?? 0}
                            readOnly
                            precision={0.5}
                            size="medium"
                            sx={{
                                '& .MuiRating-iconFilled': { color: '#113F67' },
                                '& .MuiRating-iconEmpty': { color: '#bbc5d0' },
                            }}
                        />
                        <Typography sx={textSx} fontWeight={700}>
                            {review.rating ?? 0}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography sx={{ ...textSx, color: '#6b7785' }}>
                            등록일 {fmtDate(review.regDate)}
                        </Typography>
                    </Stack>

                    <Typography sx={{ ...textSx, whiteSpace: 'pre-line' }} mt={2}>
                        {expanded ? (review.reason ?? "") : snippet(review.reason, 60)}
                    </Typography>

                </Box>

                <Grid container direction="column" justifyContent="center">
                    <Grid item alignSelf="center">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onToggle}
                            sx={{ minWidth: 0, p: '0px 4px', color: '#113F67', fontWeight: 600 }}
                        >
                            {expanded ? '접기' : '펼치기'}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Grid item>
                    <Collapse in={expanded} timeout={200} unmountOnExit>
                        <Box mt={1.5}>
                            <Typography sx={{ ...textSx, color: '#6b7785' }} mt={1}>
                                운송 기록 ID: {review.assignedId ?? '-'}
                            </Typography>
                        </Box>
                    </Collapse>
                </Grid>
                <Grid item>
                    {expanded && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onReportClick}
                            sx={{ minWidth: 0, p: '0px 4px', color: thisTheme.palette.text.primary, fontWeight: 600, bgcolor: thisTheme.palette.error.main }}
                        >
                            신고하기
                        </Button>
                    )}
                </Grid>


            </Grid>
            <EmergencyReportModal
                open={showReport}
                assignId={review.assignedId}
                presetCategory="REVIEW"
                lockCategory={true}
                onClose={() => setShowReport(false)}
                onReport={handleEmergencyReport}
            />
        </Paper>
    );
}