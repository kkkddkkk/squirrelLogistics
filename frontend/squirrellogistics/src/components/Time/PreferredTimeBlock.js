import { Box, Typography, Paper, Divider } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import OperatingHoursPicker from "./OperatingHoursPicker";

export default function PreferredTimeBlock() {
    const [startTime, setStartTime] = useState(dayjs().hour(7).minute(0));
    const [endTime, setEndTime] = useState(dayjs().hour(18).minute(0));

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            {/* 타이틀 */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    선호 시간대
                </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* 시간 선택 영역 */}
            <OperatingHoursPicker
                start={startTime}
                end={endTime}
                onChange={({ start, end }) => {
                    setStartTime(start);
                    setEndTime(end);
                }}
                minuteStep={15}
            />
        </Paper>
    );
}
