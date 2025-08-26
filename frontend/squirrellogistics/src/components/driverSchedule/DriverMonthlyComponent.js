import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Button, IconButton, Typography, Dialog,
    DialogTitle, DialogContent, DialogActions,
    MenuItem, Select, FormControl, InputLabel,
    GlobalStyles, Stack,
    Grid,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ko } from "date-fns/locale";
import {
    addMonths, format, parse, startOfMonth, endOfMonth, isSameDay,
    startOfWeek as dfStartOfWeek, getDay as dfGetDay
} from "date-fns";
import MontlyDetailPopupComponent from "./MontlyDetailPopupComponent";
import { fetchDriverMonthlySchedule } from "./../../api/deliveryRequest/deliveryAssignmentAPI";
import LoadingComponent from '../../components/common/LoadingComponent';



const RBC_OVERRIDE_STYLE_ID = 'rbc-overrides-inline';

//mui설정 위에 react-big-calendar이 덧입혀지는 상황 수정, 기본 값 전부 제거.
const rbcOverrideCSS = `
.rbc-month-view { border:1px solid #bbc5d0 !important; border-radius:12px; overflow:hidden; }
.rbc-month-row + .rbc-month-row { border-top:1px solid #bbc5d0 !important; }
.rbc-header { border-bottom:1px solid #bbc5d0 !important; padding:8px; font-weight:600; background:#e2e5e7; color:#2A2A2A; }
.rbc-month-view .rbc-row-bg .rbc-day-bg + .rbc-day-bg { border-left:1px solid #bbc5d0 !important; }
.rbc-month-view .rbc-header + .rbc-header { border-left:1px solid #bbc5d0 !important; }`;

//반드시! head 맨 끝에 style 태그를 추가(appendChild).
function useAttachRbcOverrides() {
    React.useEffect(() => {
        let styleEl = document.getElementById(RBC_OVERRIDE_STYLE_ID);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = RBC_OVERRIDE_STYLE_ID;
            styleEl.type = 'text/css';
            styleEl.appendChild(document.createTextNode(rbcOverrideCSS));
            document.head.appendChild(styleEl);
        } else {
            styleEl.textContent = rbcOverrideCSS;
            document.head.appendChild(styleEl);
        }
    }, []);
}

//로케일(언어, 지역) 설정.
const locales = { ko };

//문자열/숫자 => Date 객체로 변환(파싱 오류 막기).
const ensureDate = (d) => (d instanceof Date ? d : new Date(d));

//Big Calendar에 date-fns 연결.
const localizer = dateFnsLocalizer({
    format,
    parse: (str, fmt, refDate) =>
        parse(str, fmt, ensureDate(refDate), { locale: ko }),
    startOfWeek: (date) => dfStartOfWeek(ensureDate(date), { locale: ko }),
    getDay: (date) => dfGetDay(ensureDate(date)),
    locales,
});




//실데이터 연결 캘린더에 특정일 이벤트 추가.
function buildEventsFromSchedules(dtos, year, month) {
    return (dtos ?? [])
        .filter(dto => {
            const s = new Date(dto.wantToStart);
            return s.getFullYear() === year && (s.getMonth() + 1) === month;
        })
        .map(dto => {
            // 백엔드 직렬화가 isCompleted → completed.
            const completed = dto.isCompleted ?? dto.completed ?? false;
            const start = new Date(dto.wantToStart);
            const end = new Date(dto.wantToStart);

            return {
                title: completed ? `운송 #REQ-${dto.deliveryRequestId} (완료)` : `운송 #REQ-${dto.deliveryRequestId} (예약)`,
                start,
                end,
                allDay: true,
                type: completed ? "completed" : "transport",
                assignedId: dto.assignedId,
                deliveryRequestId: dto.deliveryRequestId,
                raw: dto,
            };
        });
}

//특정 연/월의 첫째 날 반환 함수.
const toYearMonthDate = (y, m) => new Date(y, m - 1, 1);

//숫자를 2자리 문자열 전환 함수.
const pad2 = (n) => String(n).padStart(2, "0");

//이벤트 라벨 표시.
function MonthEvent({ event }) {
    return (
        <Box
            sx={{
                fontSize: 14,
                pt: "2px",
                fontWeight: "bold",
                display: "inline-block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
            title={event.title}
        >
            {event.title}
        </Box>
    );
}

//DriverMonthlyComponent: 컴포넌트 메인부 시작.
export default function DriverMonthlyComponent() {
    useAttachRbcOverrides();
    const navigate = useNavigate();

    //URL 파라미터 받기 => { driverId, year, month }
    const params = useParams();

    //파라미터가 없으면 현재 날짜 사용하기.
    const initial = useMemo(() => {
        const now = new Date();
        return {
            driverId: params.driverId ?? "99999",
            year: params.year ? Number(params.year) : now.getFullYear(),
            month: params.month ? Number(params.month) : now.getMonth() + 1,
        };
    }, [params.driverId, params.year, params.month]);

    //상태값 감지용 useState변수들.
    const [currentYM, setCurrentYM] = useState({ year: initial.year, month: initial.month });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [openPicker, setOpenPicker] = useState(false);
    const [pickYear, setPickYear] = useState(initial.year);
    const [pickMonth, setPickMonth] = useState(initial.month);

    //현재 표시 중인 달의 DATE객체.
    const currentDate = useMemo(
        () => toYearMonthDate(currentYM.year, currentYM.month),
        [currentYM]
    );

    //캘린더의 기사 일정 이벤트 마커 추가 => setEvents로 start와 end지정.
    const loadEvents = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        const controller = new AbortController();
        try {
            const list = await fetchDriverMonthlySchedule(
                initial.driverId,
                currentYM.year,
                currentYM.month,
                { signal: controller.signal }
            );
            const evts = buildEventsFromSchedules(list, currentYM.year, currentYM.month).map(e => ({
                ...e,
                start: ensureDate(e.start),
                end: ensureDate(e.end),
            }));
            setEvents(evts);
        } catch (err) {
            console.error(err);
            setErrorMsg("일정 데이터를 불러오지 못했습니다.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
        return () => controller.abort();
    }, [initial.driverId, currentYM.year, currentYM.month]);


    useEffect(() => { loadEvents(); }, [loadEvents]);

    useEffect(() => {
        navigate(`/driver/${initial.driverId}/calendar/${currentYM.year}/${pad2(currentYM.month)}`, { replace: true });
    }, [currentYM, initial.driverId, navigate]);

    //이전달, 다음달 이동 버튼 클릭 함수 => currentDate +1 혹은 -1.
    const goPrev = () => {
        const d = addMonths(currentDate, -1);
        setCurrentYM({ year: d.getFullYear(), month: d.getMonth() + 1 });
    };
    const goNext = () => {
        const d = addMonths(currentDate, 1);
        setCurrentYM({ year: d.getFullYear(), month: d.getMonth() + 1 });
    };

    //우측 상단 선택된 년/월 출력 라벨.
    const titleLabel = useMemo(() => `${currentYM.year}년 ${currentYM.month}월`, [currentYM]);

    //완료 일정 / 미완료 일정 마커 색상 구분.
    const eventPropGetter = useCallback((event) => {
        const isCompleted = event.type === "completed";
        return {
            style: {
                backgroundColor: isCompleted ? "#606060" : "#113F67",
                color: "#fff",
                border: `1px solid ${isCompleted ? "#525252" : "#051829"}`,
                borderRadius: 999,
                lineHeight: 1.2,
                paddingTop: 2,
                paddingBottom: 2,
            },
        };
    }, []);

    //[오늘]을 굵게 표시 => 진한 남색 배경, 아웃라인(임시 스타일).
    const dayPropGetter = useCallback((date) => {
        if (isSameDay(date, new Date())) {
            return {
                className: "rbc-today-custom",
                style: { outline: "2px solid #113F67", outlineOffset: "-2px", background: "rgba(25, 118, 210, 0.06)" },
            };
        }
        return {};
    }, []);

    //이번달 첫일과 막일 제한.
    const min = startOfMonth(currentDate);
    const max = endOfMonth(currentDate);

    //년/월 선택 팝업 오픈 핸들러.
    const handleOpenPicker = () => {
        setPickYear(currentYM.year);
        setPickMonth(currentYM.month);
        setOpenPicker(true);
    };
    const handleApplyPicker = () => {
        setCurrentYM({ year: pickYear, month: pickMonth });
        setOpenPicker(false);
    };

    //---------- 개별 이벤트 클릭 팝업 핸들러 ----------.
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDto, setSelectedDto] = useState(null);

    // 이벤트 클릭 시 요청 정보 전달(팝업에서 추가 조회 필요, assignedId/deliveryRequestId 넘김)
    const handleSelectEvent = useCallback((ev) => {
        setSelectedDto({
            requestId: ev.deliveryRequestId,
            assignedId: ev.assignedId,
            completed: ev.type === "completed",
        });
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedDto(null);
    }, []);

    const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <Box width={"100%"} justifyItems={"center"}>
            <GlobalStyles styles={{
                ".rbc-calendar": { background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "90%" },
                ".rbc-toolbar": { display: "none !important" },
                ".rbc-month-view": { border: "1px solid #bbc5d0", borderRadius: 12, overflow: "hidden" },
                ".rbc-month-row + .rbc-month-row": { borderTop: "1px solid #bbc5d0" },
                ".rbc-header": { borderBottom: "1px solid #bbc5d0", padding: 8, fontWeight: 600, background: "#e2e5e7", color: "#2A2A2A" },
                ".rbc-date-cell": { padding: 8 },
                ".rbc-off-range-bg": { background: "#fafafa" },
                ".rbc-event, .rbc-event-allday": {
                    boxShadow: "none", border: "none", borderRadius: 999, padding: 0, height: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                },
                ".rbc-today": { background: "transparent" },
                ".rbc-row-segment": { display: "flex", alignItems: "flex-end" },
                ".rbc-month-view .rbc-row-bg .rbc-day-bg + .rbc-day-bg": { borderLeft: "1px solid #bbc5d0 !important" },
                ".rbc-month-view .rbc-header + .rbc-header": { borderLeft: "1px solid #bbc5d0 !important" },
            }} />

            <Grid width={"100%"} justifyItems={"center"}
                sx={{ background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)", minHeight: 160 }}
            >
                <Typography variant="h4" align="center" pt={4} gutterBottom
                    sx={{ fontFamily: "inherit", fontSize: "2.0rem", fontWeight: "bold", color: "#2A2A2A", m: 0 }}>
                    월별 일정표
                </Typography>
                <Grid container direction="row" alignItems="center" justifyContent={"space-between"} width={"90%"} pt={2}>
                    <Grid container direction="row" spacing={1} alignSelf={"flex-start"}>
                        <Button variant="outlined" startIcon={<ChevronLeftIcon />}
                            sx={{ color: "#113F67", backgroundColor: "white", borderColor: "#113F67" }} onClick={goPrev}>
                            지난달
                        </Button>
                        <Button variant="outlined" endIcon={<ChevronRightIcon />}
                            sx={{ color: "#113F67", backgroundColor: "white", borderColor: "#113F67" }} onClick={goNext}>
                            다음달
                        </Button>
                    </Grid>
                    <Grid container direction="row" spacing={1} alignItems="center">
                        <Typography variant="h3" align="center"
                            sx={{ fontFamily: "inherit", fontSize: "1.2rem", fontWeight: "bold", color: "#113F67", m: 0 }}>
                            {titleLabel}
                        </Typography>
                        <IconButton aria-label="월 선택" onClick={handleOpenPicker}>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>

            {/* 에러/로딩 간단 표시 */}
            {errorMsg && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>{errorMsg}</Typography>
            )}

            {loading && (
                <LoadingComponent open={loading} text="운송 일정 정보를 불러오는 중..." />
            )}
            {/* 메인 캘린더 */}
            <Calendar
                toolbar={false}
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                date={currentDate}
                views={["month"]}
                style={{ height: "calc(100vh - 240px)", width: "90%", margin: "0 auto" }}
                messages={{
                    next: "다음", previous: "이전", today: "오늘",
                    month: "월", week: "주", day: "일", date: "날짜", time: "시간", event: "일정",
                    showMore: (total) => `+${total} 더보기`,
                }}
                eventPropGetter={eventPropGetter}
                dayPropGetter={dayPropGetter}
                components={{ month: { event: MonthEvent } }}
                onSelectEvent={handleSelectEvent}
                min={startOfMonth(currentDate)}
                max={endOfMonth(currentDate)}
                popup
            />

            {/* 상세 모달 */}
            {dialogOpen && (
                <MontlyDetailPopupComponent
                    driverId={String(initial.driverId)}
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    requestId={selectedDto?.requestId}
                    assignedId={selectedDto?.assignedId}
                    completed={!!selectedDto?.completed}
                />
            )}

            {/* 월 선택 다이얼로그 */}
            <Dialog open={openPicker} onClose={() => setOpenPicker(false)}>
                <DialogTitle textAlign={"center"}>연도 / 월 선택</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={20} sm={12}>
                            <FormControl fullWidth>
                                <InputLabel id="year-label" sx={{ backgroundColor: "white" }}>연도</InputLabel>
                                <Select labelId="year-label" value={pickYear} onChange={(e) => setPickYear(e.target.value)}>
                                    {years.map((y) => (<MenuItem key={y} value={y}>{y}년</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={20} sm={8}>
                            <FormControl fullWidth>
                                <InputLabel id="month-label" sx={{ backgroundColor: "white" }}>월</InputLabel>
                                <Select labelId="month-label" value={pickMonth} onChange={(e) => setPickMonth(e.target.value)}>
                                    {months.map((m) => (<MenuItem key={m} value={m}>{m}월</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: "space-between" }} >
                    <Button variant="outlined" onClick={() => setOpenPicker(false)}>취소</Button>
                    <Button variant="contained" onClick={handleApplyPicker}>적용</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}