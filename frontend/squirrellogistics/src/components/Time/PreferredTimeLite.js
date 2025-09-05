import React, { useMemo } from "react";
import { Box, TextField, Typography, Stack } from "@mui/material";
import dayjs from "dayjs";

//작성자: 고은설.
//기능: 경량 선호시간 피커.
//사용처: 운전자 개인정보 수정란, 선호 운행 시간 선택 영역.
export default function PreferredTimeLite({
  start = null,
  end = null,
  onChange,
  minuteStep = 15,
  labelStart = "시작",
  labelEnd = "종료",
  requiredSeconds = true,
  fullWidth = true,
}) {
  const toDayjs = (v) => {
    if (!v) return null;
    if (dayjs.isDayjs(v)) return v.second(v.second() || 0);
    if (typeof v === "string") {
      const [h, m = "00", s = "00"] = v.split(":");
      return dayjs().hour(Number(h)).minute(Number(m)).second(Number(s));
    }
    return null;
  };

  const toHHMM = (d) => (d ? d.format("HH:mm") : "");
  const toHHMMSS = (d) => (d ? d.format("HH:mm:ss") : "");

  const emit = (s, e) => {
    if (!onChange) return;
    const startStr = requiredSeconds ? toHHMMSS(s) : toHHMM(s);
    const endStr = requiredSeconds ? toHHMMSS(e) : toHHMM(e);
    onChange({ start: s, end: e, startStr, endStr });
  };

  const startD = useMemo(() => toDayjs(start) || dayjs().hour(7).minute(0).second(0), [start]);
  const endD = useMemo(() => toDayjs(end) || dayjs().hour(18).minute(0).second(0), [end]);

  const [startStrHHMM, endStrHHMM] = [toHHMM(startD), toHHMM(endD)];

  const invalid = endD.isBefore(startD) || endD.isSame(startD);

  const handleStartChange = (e) => {
    const [h, m] = (e.target.value || "00:00").split(":");
    const next = dayjs().hour(Number(h)).minute(Number(m)).second(0);
    emit(next, endD);
  };

  const handleEndChange = (e) => {
    const [h, m] = (e.target.value || "00:00").split(":");
    const next = dayjs().hour(Number(h)).minute(Number(m)).second(0);
    emit(startD, next);
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        운행 선호 시간
      </Typography>
      <Stack direction="row" spacing={2}>
        <TextField
          type="time"
          label={labelStart}
          value={startStrHHMM}
          onChange={handleStartChange}
          inputProps={{ step: minuteStep * 60 }} // 초 단위
          fullWidth={fullWidth}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="time"
          label={labelEnd}
          value={endStrHHMM}
          onChange={handleEndChange}
          inputProps={{ step: minuteStep * 60 }}
          fullWidth={fullWidth}
          error={invalid}
          helperText={invalid ? "종료시간은 시작시간보다 늦어야 합니다." : " "}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    </Box>
  );
}