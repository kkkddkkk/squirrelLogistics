import { Box, Grid, TextField, Typography, Stack, Chip, useTheme, useMediaQuery } from "@mui/material";
import dayjs from "dayjs";

export default function PreferredTimeBlock({ start, end, onChange }) {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

    const fmtHM = (d) => (d ? dayjs(d).format("HH:mm") : "");

    const setRange = (s, e) => {
        const sd = dayjs().hour(Number(s.split(":")[0])).minute(Number(s.split(":")[1]));
        const ed = dayjs().hour(Number(e.split(":")[0])).minute(Number(e.split(":")[1]));
        onChange?.({ start: sd, end: ed });
    };

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: "background.paper",
            }}
        >
            <Typography variant="h6" sx={{ mb: 1.5 }}>
                선호 시간대
            </Typography>

            <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="시작 시간"
                        type="time"
                        fullWidth
                        value={fmtHM(start)}
                        onChange={(e) => {
                            const [hh, mm] = e.target.value.split(":").map((n) => Number(n));
                            const next = dayjs(start || undefined).hour(hh).minute(mm);
                            onChange?.({ start: next, end });
                        }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="종료 시간"
                        type="time"
                        fullWidth
                        value={fmtHM(end)}
                        onChange={(e) => {
                            const [hh, mm] = e.target.value.split(":").map((n) => Number(n));
                            const next = dayjs(end || undefined).hour(hh).minute(mm);
                            onChange?.({ start, end: next });
                        }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 0.5 }}
                    >
                        <Chip
                            label="주간(07:00~18:00)"
                            onClick={() => setRange("07:00", "18:00")}
                            clickable
                            variant="outlined"
                        />
                        <Chip
                            label="야간(18:00~01:00)"
                            onClick={() => setRange("18:00", "01:00")}
                            clickable
                            variant="outlined"
                        />
                        <Chip
                            label="심야(22:00~06:00)"
                            onClick={() => setRange("22:00", "06:00")}
                            clickable
                            variant="outlined"
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}