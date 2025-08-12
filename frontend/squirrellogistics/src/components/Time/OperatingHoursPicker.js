// src/components/OperatingHoursPicker.jsx
import { useMemo } from "react";
import { Box, Chip, TextField, FormHelperText } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const fmt = "HH:mm";

export default function OperatingHoursPicker({
    start,                // dayjs | null
    end,                  // dayjs | null
    onChange,             // (next:{start:dayjs|null,end:dayjs|null}) => void
    error,                // boolean
    helperText,           // string
    minuteStep = 15,      // 분 간격
}) {
    const overnight = useMemo(() => {
        if (!start || !end) return false;
        // 종료가 시작보다 이전이면 "익일"로 간주
        return end.isBefore(start);
    }, [start, end]);

    const setPreset = (s, e) => onChange({ start: s, end: e });

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "flex-start" }}>
                <TimePicker
                    label="시작 시간"
                    value={start}
                    onChange={(v) => onChange({ start: v, end })}
                    minutesStep={minuteStep}
                    ampm={false}
                    slotProps={{
                        textField: {
                            error,
                            helperText: helperText || " ",
                            sx: { minWidth: 200 },
                        },
                    }}
                />
                <TimePicker
                    label="종료 시간"
                    value={end}
                    onChange={(v) => onChange({ start, end: v })}
                    minutesStep={minuteStep}
                    ampm={false}
                    slotProps={{
                        textField: {
                            error,
                            helperText: helperText || (overnight ? "익일 종료" : " "),
                            sx: { minWidth: 200 },
                        },
                    }}
                />

                {/* 빠른 선택 칩 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                        label="주간(07:00~18:00)"
                        onClick={() => setPreset(dayjs().hour(7).minute(0), dayjs().hour(18).minute(0))}
                        variant="outlined"
                        size="small"
                    />
                    <Chip
                        label="야간(18:00~01:00)"
                        onClick={() => setPreset(dayjs().hour(18).minute(0), dayjs().hour(1).minute(0))}
                        variant="outlined"
                        size="small"
                    />
                    <Chip
                        label="심야(22:00~06:00)"
                        onClick={() => setPreset(dayjs().hour(22).minute(0), dayjs().hour(6).minute(0))}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </Box>

            {/* 안내/검증 메시지 추가 영역 */}
            {overnight && (
                <FormHelperText sx={{ ml: 1 }}>종료 시간이 시작 시간보다 이르면 “익일 종료”로 처리합니다.</FormHelperText>
            )}
        </LocalizationProvider>
    );
}
